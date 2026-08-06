import { render, screen } from "@testing-library/react";
import { HourlyForecastStrip } from "./hourly-forecast-strip";

const mockHourlyData = [
  { time: "08:00", temperature: 30, condition: "Cerah" },
  { time: "09:00", temperature: 31, condition: "Berawan" },
];

describe("HourlyForecastStrip", () => {
  it("renders horizontal scrollable layout", () => {
    const { container } = render(<HourlyForecastStrip hourlyForecasts={mockHourlyData} />);
    
    expect(container.firstChild).toHaveClass("overflow-x-auto");
    expect(container.firstChild).toHaveClass("pb-2");
  });

  it("displays all forecasts", () => {
    render(<HourlyForecastStrip hourlyForecasts={mockHourlyData} />);
    
    mockHourlyData.forEach(hour => {
      expect(screen.getByText(hour.time)).toBeInTheDocument();
    });
  });
});
