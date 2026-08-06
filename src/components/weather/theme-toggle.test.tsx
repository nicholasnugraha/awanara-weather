import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

describe("ThemeToggle", () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders toggle button correctly", () => {
    render(<ThemeToggle currentTheme="light" onToggle={mockOnToggle} />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("calls onToggle when clicked", () => {
    render(<ThemeToggle currentTheme="light" onToggle={mockOnToggle} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it("has hover effect", () => {
    const { container } = render(<ThemeToggle currentTheme="light" onToggle={mockOnToggle} />);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-surface-container");
  });
});
