import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("menampilkan heading utama Awanara", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /awanara/i }),
    ).toBeInTheDocument();
  });

  it("menampilkan status pengembangan", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/dalam pengembangan/i),
    ).toBeInTheDocument();
  });
});
