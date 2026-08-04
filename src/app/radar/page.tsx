import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export const metadata: Metadata = {
  title: "Peta Radar",
};

export default function RadarPage() {
  return (
    <PlaceholderPage
      title="Peta Radar"
      description="Peta radar presipitasi akan tersedia di sini setelah sumber radar gratis terverifikasi."
    />
  );
}
