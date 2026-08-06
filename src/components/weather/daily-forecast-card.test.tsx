import { render, screen } from "@testing-library/react";
import { DailyForecastCard } from "./daily-forecast-card";

describe("DailyForecastCard", () => {
  const defaultProps = {
    date: "Senin",
    minTemp: 24,
    maxTemp: 32,
    condition: "Cerah Berawan",
    icon: "01d",
  };

  it("displays all forecast information correctly", () => {
    render(<DailyForecastCard {...defaultProps} />);
    
    expect(screen.getByText("Senin")).toBeInTheDocument();
    expect(screen.getByText("32°")).toBeInTheDocument();
    expect(screen.getByText("24°")).toBeInTheDocument();
    expect(screen.getByText("Cerah Berawan")).toBeInTheDocument();
  });

  it("applies temperature-based color coding", () => {
    const { container } = render(<DailyForecastCard {...defaultProps} />);
    
    // High temp (32) should be red/danger color
    expect(screen.getByText("32°")).toHaveClass("text-danger");
    // Low temp (24) should be green/success color
    expect(screen.getByText("24°")).not.toHaveClass("text-danger");
  });

  it("has gradient visualization bar", () => {
    const { container } = render(<DailyForecastCard {...defaultProps} />);
    
    expect(container.querySelector(".bg-current")).toBeInTheDocument();
    expect(container.querySelector(".bg-brand-500")).toBeInTheDocument();
  });
});
