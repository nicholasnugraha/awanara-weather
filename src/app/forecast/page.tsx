import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export const metadata: Metadata = {
  title: "Prakiraan",
};

export default function ForecastPage() {
  return (
    <PlaceholderPage
      title="Prakiraan Cuaca"
      description="Prakiraan per jam dan 7-8 hari ke depan akan tersedia di sini pada fase berikutnya."
    />
  );
}
