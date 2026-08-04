import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("menampilkan heading utama", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /cuaca, dalam genggaman/i }),
    ).toBeInTheDocument();
  });

  it("menampilkan status pengembangan", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/sedang dalam pengembangan/i),
    ).toBeInTheDocument();
  });
});
