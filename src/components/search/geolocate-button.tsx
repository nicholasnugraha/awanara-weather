"use client";

import { useState, useCallback } from "react";

interface GeolocateButtonProps {
  onLocationFound: (lat: number, lon: number, city?: string) => void;
  className?: string;
}

export function GeolocateButton({ onLocationFound, className }: GeolocateButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleGeolocate = useCallback(async () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Browser Anda tidak mendukung Geolocation");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Simple reverse geocoding via OpenStreetMap Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "Awanara-Weather/1.0 (contact@awanara.local)",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Lokasi Anda";
          const country = data.address.country ?? "ID";

          onLocationFound(latitude, longitude, `${city}, ${country}`);
          setStatus("success");
        } else {
          throw new Error("Reverse geocoding failed");
        }
      } catch {
        // Fallback if geocoding fails
        onLocationFound(latitude, longitude);
        setStatus("success");
      }
    } catch (err) {
      let errorMsg = "Gagal mendapatkan lokasi Anda";

      if (err instanceof DOMException && err.name === "NotAllowedError") {
        errorMsg = "Akses lokasi ditolak. Silakan izinkan di pengaturan browser.";
      } else if (err instanceof DOMException && err.name === "TimeoutError") {
        errorMsg = "Waktu permintaan lokasi habis. Coba lagi.";
      } else if (err instanceof DOMException && err.name === "PositionUnavailable") {
        errorMsg = "Tidak dapat mendeteksi lokasi. Pastikan GPS aktif.";
      }

      setErrorMessage(errorMsg);
      setStatus("error");

      console.error("Geolocation error:", err);
    }

    // Reset status after a delay
    setTimeout(() => {
      setStatus("idle");
    }, 2000);
  }, [onLocationFound]);

  const renderStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <svg className="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case "success":
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleGeolocate}
        disabled={status === "loading"}
        title={status === "idle" ? "Gunakan lokasi saya" : undefined}
        className={`rounded-lg bg-surface-card p-3 text-text shadow-card transition-all hover:bg-surface-container hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:hover:bg-surface-card disabled:hover:shadow-card ${className}`}
      >
        {renderStatusIcon()}
      </button>

      {/* Tooltip/Error Message */}
      {status === "error" && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-warning px-2 py-1 text-xs text-white shadow">
          {errorMessage}
        </div>
      )}

      {status === "success" && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-success px-2 py-1 text-xs text-white shadow">
          Lokasi ditemukan!
        </div>
      )}
    </div>
  );
}
