import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigation } from "./navigation";

describe("Navigation", () => {
  it("merender semua item navigasi dengan accessible name", () => {
    render(<Navigation pathname="/" variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: /navigasi utama/i });
    expect(
      within(nav).getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /prakiraan/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /peta radar/i }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole("link", { name: /pengaturan/i }),
    ).toBeInTheDocument();
  });

  it("menandai item aktif dengan aria-current=page", () => {
    render(<Navigation pathname="/forecast" variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: /navigasi utama/i });
    const active = within(nav).getByRole("link", { name: /prakiraan/i });
    expect(active).toHaveAttribute("aria-current", "page");
  });

  it("home (/) hanya aktif pada pathname persis /", () => {
    const { rerender } = render(
      <Navigation pathname="/forecast" variant="sidebar" />,
    );
    const nav = screen.getByRole("navigation", { name: /navigasi utama/i });
    expect(
      within(nav).getByRole("link", { name: /dashboard/i }),
    ).not.toHaveAttribute("aria-current");

    rerender(<Navigation pathname="/" variant="sidebar" />);
    expect(
      within(nav).getByRole("link", { name: /dashboard/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("cocok untuk sub-path (mis. /forecast/detail)", () => {
    render(<Navigation pathname="/forecast/2026-08-04" variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: /navigasi utama/i });
    expect(
      within(nav).getByRole("link", { name: /prakiraan/i }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("semua link dapat difokus dengan keyboard sesuai urutan", async () => {
    const user = userEvent.setup();
    render(<Navigation pathname="/" variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: /navigasi utama/i });
    const links = within(nav).getAllByRole("link");

    await user.tab();
    expect(links[0]).toHaveFocus();

    await user.tab();
    expect(links[1]).toHaveFocus();

    await user.tab();
    expect(links[2]).toHaveFocus();

    await user.tab();
    expect(links[3]).toHaveFocus();
  });
});
