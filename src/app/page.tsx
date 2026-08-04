import { DashboardContainer } from "@/app/dashboard";
import { useTheme } from "@/components/theme/theme-provider";

/**
 * Home Page - Main Weather Dashboard
 */
"use client";

export default function HomePage() {
  const { theme } = useTheme();
  
  return <DashboardContainer theme={theme} />;
}
