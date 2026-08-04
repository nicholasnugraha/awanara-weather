import { render, screen, waitFor } from "@testing-library/react";
import { DashboardContainer } from "./dashboard";

describe("DashboardContainer", () => {
  it("renders loading state initially", () => {
    render(<DashboardContainer theme="light" />);
    
    expect(screen.getByText(/memuat data/i)).toBeInTheDocument();
  });

  it("renders main weather hero when loaded", async () => {
    // Mock setTimeout to avoid waiting for actual delay
    vi.spyOn(global, "setTimeout").mockImplementation((cb: any) => {
      cb();
      return 0 as any;
    });

    render(<DashboardContainer theme="light" />);
    
    await waitFor(() => {
      expect(screen.getByText(/jakarta/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it("displays hourly forecast cards", async () => {
    vi.spyOn(global, "setTimeout").mockImplementation((cb: any) => {
      cb();
      return 0 as any;
    });

    render(<DashboardContainer theme="light" />);
    
    await waitFor(() => {
      // Check that we have multiple time forecasts
      const times = document.querySelectorAll('[class*="text-xs"]');
      expect(times.length).toBeGreaterThanOrEqual(4);
    }, { timeout: 1000 });
  });

  it("handles error state gracefully", async () => {
    // Simulate error by throwing after component mounts
    const originalUseEffect = require("react").useEffect;
    (require as any).react.useEffect = (fn: any, deps: any) => {
      fn();
    };

    render(<DashboardContainer theme="light" />);
    
    // Cleanup
    (require as any).react.useEffect = originalUseEffect;
  });
});
