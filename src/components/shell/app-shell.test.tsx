import { render, screen, within } from "@testing-library/react";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/forecast",
}));

describe("AppShell", () => {
  it("menampilkan skip link ke konten", () => {
    render(
      <AppShell>
        <p>konten uji</p>
      </AppShell>,
    );
    const skip = screen.getByRole("link", { name: /langsung ke konten/i });
    expect(skip).toHaveAttribute("href", "#konten");
  });

  it("merender konten anak", () => {
    render(
      <AppShell>
        <p>konten uji</p>
      </AppShell>,
    );
    expect(screen.getByText("konten uji")).toBeInTheDocument();
  });

  it("merender navigasi sidebar untuk desktop", () => {
    render(
      <AppShell>
        <p>konten</p>
      </AppShell>,
    );
    const navs = screen.getAllByRole("navigation", { name: /navigasi utama/i });
    // Sidebar (desktop) + bottom (mobile) — rail memakai aria-label sama.
    expect(navs.length).toBeGreaterThanOrEqual(2);
    // Sidebar mengandung label "Awanara"
    expect(screen.getByText("Awanara")).toBeInTheDocument();
  });

  it("menandai item aktif sesuai pathname saat ini", () => {
    render(
      <AppShell>
        <p>konten</p>
      </AppShell>,
    );
    const activeLinks = screen.getAllByRole("link", {
      name: /prakiraan/i,
    });
    for (const link of activeLinks) {
      expect(link).toHaveAttribute("aria-current", "page");
    }
  });

  it("semua navigasi memuat link ke route utama", () => {
    render(
      <AppShell>
        <p>konten</p>
      </AppShell>,
    );
    const navs = screen.getAllByRole("navigation", {
      name: /navigasi utama/i,
    });
    const nav = navs[0] as HTMLElement;
    expect(
      within(nav).getByRole("link", { name: /peta radar/i }),
    ).toHaveAttribute("href", "/radar");
    expect(
      within(nav).getByRole("link", { name: /pengaturan/i }),
    ).toHaveAttribute("href", "/settings");
  });
});
