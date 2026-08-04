import { render, screen } from "@testing-library/react";
import { HourlyForecastStrip } from "./hourly-forecast-strip";

const mockHourlyData = [
  { time: "08:00", temperature: 30, condition: "Cerah" },
  { time: "09:00", temperature: 31, condition: "Berawan" },
  { time: "10:00", temperature: 32, condition: "Cerah" },
];

describe("HourlyForecastStrip", () => {
  it("renders all hourly forecasts", () => {
    render(<HourlyForecastStrip hourlyForecasts={mockHourlyData} />);
    
    mockHourlyData.forEach((hour, index) => {
      // Use queryAllByText and check count to avoid "multiple elements" error
      const times = screen.getAllByText(hour.time);
      expect(times[index]).toBeInTheDocument();
      
      const temps = screen.getAllByText(`${hour.temperature}°`);
      expect(temps[index]).toBeInTheDocument();
      
      const conditions = screen.getAllByText(hour.condition);
      expect(conditions[index]).toBeInTheDocument();
    });
  });

  it("renders horizontal scrollable layout", () => {
    const { container } = render(<HourlyForecastStrip hourlyForecasts={mockHourlyData} />);
    
    expect(container.firstChild).toHaveClass("overflow-x-auto");
    expect(container.firstChild).toHaveClass("pb-2");
  });

  it("renders individual cards with correct structure", () => {
    render(<HourlyForecastStrip hourlyForecasts={mockHourlyData} />);
    
    // Cards should be div elements, not buttons
    const cards = document.querySelectorAll('[class*="flex"]');
    expect(cards).toHaveLength(mockHourlyData.length);
    
    // Check first card has required classes
    const firstCard = cards[0];
    expect(firstCard).toHaveClass("w-24");
    expect(firstCard).toHaveClass("flex");
  });
});
