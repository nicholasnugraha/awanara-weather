import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export const metadata: Metadata = {
  title: "Pengaturan",
};

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Pengaturan"
      description="Unit, tema, dan privasi akan diatur di sini pada fase berikutnya."
    />
  );
}
