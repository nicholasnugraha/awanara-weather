"use client";

/**
 * Home Page - Main Weather Dashboard
 */
import { DashboardContainer } from "@/app/dashboard";
import { useTheme } from "@/components/theme/theme-provider";

export default function HomePage() {
  const { theme } = useTheme();

  return <DashboardContainer theme={theme} />;
}
