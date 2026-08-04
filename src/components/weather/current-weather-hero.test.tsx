import { render, screen } from "@testing-library/react";
import { CurrentWeatherHero } from "./current-weather-hero";

describe("CurrentWeatherHero", () => {
  it("displays temperature correctly", () => {
    render(<CurrentWeatherHero temperature={32} condition="Cerah" city="Jakarta" />);
    
    expect(screen.getByText("32°")).toBeInTheDocument();
    expect(screen.getByText("Cerah")).toBeInTheDocument();
    expect(screen.getByText("Jakarta")).toBeInTheDocument();
  });

  it("applies gradient background classes", () => {
    const { container } = render(
      <CurrentWeatherHero temperature={32} condition="Cerah" city="Jakarta" />
    );
    
    expect(container.firstChild).toHaveClass("bg-gradient-to-br");
    expect(container.firstChild).toHaveClass("from-brand-500");
  });

  it("uses responsive text sizes", () => {
    const { container } = render(
      <CurrentWeatherHero temperature={32} condition="Cerah" city="Jakarta" />
    );
    
    // Check for responsive class
    expect(container.querySelector("span")).toHaveClass("text-6xl");
    expect(container.querySelector("span") as HTMLElement).toHaveClass("md:text-7xl");
  });
});
