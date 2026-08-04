import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "./search-bar";

describe("SearchBar", () => {
  const mockOnCitySelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    render(<SearchBar onCitySelect={mockOnCitySelect} />);
    
    const input = screen.getByPlaceholderText(/cari kota/i);
    expect(input).toBeInTheDocument();
  });

  it("shows suggestions when typing", async () => {
    const user = userEvent.setup();
    render(<SearchBar onCitySelect={mockOnCitySelect} />);
    
    const input = screen.getByPlaceholderText(/cari kota/i);
    await user.type(input, "Jak");
    
    await waitFor(() => {
      expect(screen.getByText(/Jakarta/)).toBeInTheDocument();
    });
  });

  it("filters suggestions based on query", async () => {
    const user = userEvent.setup();
    render(<SearchBar onCitySelect={mockOnCitySelect} />);
    
    const input = screen.getByPlaceholderText(/cari kota/i);
    await user.type(input, "Band");
    
    await waitFor(() => {
      expect(screen.getByText(/Bandung/)).toBeInTheDocument();
      expect(screen.queryByText(/Jakarta/)).not.toBeInTheDocument();
    });
  });

  it("calls onCitySelect when suggestion clicked", async () => {
    const user = userEvent.setup();
    render(<SearchBar onCitySelect={mockOnCitySelect} />);
    
    const input = screen.getByPlaceholderText(/cari kota/i);
    await user.type(input, "Jak");
    
    const jakartaBtn = await screen.findByText(/Jakarta/i);
    await user.click(jakartaBtn);
    
    await waitFor(() => {
      expect(mockOnCitySelect).toHaveBeenCalledWith("Jakarta, ID");
    });
  });

  it("hides suggestions after selection", async () => {
    const user = userEvent.setup();
    render(<SearchBar onCitySelect={mockOnCitySelect} />);
    
    const input = screen.getByPlaceholderText(/cari kota/i);
    await user.type(input, "Jak");
    
    const jakartaBtn = await screen.findByText(/Jakarta/i);
    await user.click(jakartaBtn);
    
    // After selection, suggestions should be gone
    expect(screen.queryByText(/Jakarta/)).not.toBeInTheDocument();
  });
});
