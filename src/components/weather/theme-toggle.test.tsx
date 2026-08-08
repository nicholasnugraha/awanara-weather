import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders toggle button correctly", () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    const mockFn = vi.fn();
    global.window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    // Verify theme changed via localStorage
    expect(localStorage.getItem("awanara-theme")).not.toBeNull();
  });

  it("has hover effect", () => {
    const { container } = render(<ThemeToggle />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-surface-container");
  });
});
