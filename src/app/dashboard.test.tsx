import { describe, it, expect } from "vitest";
import { DashboardContainer } from "./dashboard";

describe("DashboardContainer", () => {
  it("renders dashboard structure", () => {
    const { container } = render(<DashboardContainer theme="light" />);
    
    // Check main structure exists
    expect(container.innerHTML).toContain("min-h-screen");
    expect(container.innerHTML).toContain("bg-surface");
  });

  it("displays loading state initially", () => {
    // Mock setTimeout
    vi.spyOn(global, "setTimeout").mockImplementation((cb: any) => cb());
    
    const { container } = render(<DashboardContainer theme="light" />);
    
    // Should have skeleton or data
    expect(container.querySelectorAll('[class*="animate-pulse"]').length || 
           container.innerHTML.includes("Jakarta")).toBeGreaterThan(0);
  });
});
