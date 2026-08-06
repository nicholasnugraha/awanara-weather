import { render, screen } from "@testing-library/react";
import { WeatherDetailsGrid } from "./weather-details-grid";

describe("WeatherDetailsGrid", () => {
  const defaultProps = {
    humidity: 70,
    windSpeed: 15,
    pressure: 1013,
    visibility: 10,
    uvIndex: 8.5,
  };

  it("renders all metrics when all props provided", () => {
    render(<WeatherDetailsGrid {...defaultProps} />);
    
    expect(screen.getByText(/Kelembaban/i)).toBeInTheDocument();
    expect(screen.getByText(/Angin/i)).toBeInTheDocument();
    expect(screen.getByText(/Tekanan/i)).toBeInTheDocument();
    expect(screen.getByText(/Jarak Pandang/i)).toBeInTheDocument();
    expect(screen.getByText(/Indeks UV/i)).toBeInTheDocument();
  });

  it("renders grid with correct number of columns", () => {
    const { container } = render(<WeatherDetailsGrid {...defaultProps} />);
    
    // Mobile: 2 columns, Desktop: 4 columns
    expect(container.firstChild).toHaveClass("grid");
    expect(container.firstChild).toHaveClass("md:grid-cols-4");
  });

  it("does not render UV index when undefined", () => {
    const { container, debug } = render(
      <WeatherDetailsGrid 
        humidity={70} 
        windSpeed={15} 
        pressure={1013} 
        visibility={10}
      />
    );
    
    expect(screen.queryByText(/Indeks UV/i)).not.toBeInTheDocument();
  });

  it("applies correct unit labels", () => {
    render(<WeatherDetailsGrid {...defaultProps} />);
    
    expect(screen.getByText("%")).toBeInTheDocument();
    expect(screen.getByText("km/h")).toBeInTheDocument();
    expect(screen.getByText("hPa")).toBeInTheDocument();
    expect(screen.getByText("km")).toBeInTheDocument();
  });
});
