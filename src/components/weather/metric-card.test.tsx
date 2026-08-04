import { render, screen } from "@testing-library/react";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders with correct label and value", () => {
    render(<MetricCard label="Test Label" value={42} />);
    
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders correctly", () => {
    const { container } = render(<MetricCard label="Temperature" value={30} unit="°C" />);
    
    expect(container.querySelector(".flex")).toBeTruthy();
  });
});
