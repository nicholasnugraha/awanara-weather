/**
 * Geolocation Button Component
 * Request user location with modern Geolocation API
 */
"use client";

import { useState } from "react";

interface GeoLocationButtonProps {
  onLocationFound: (lat: number, lon: number, city: string) => void;
}

export const GeoLocationButton = ({ onLocationFound }: GeoLocationButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung Geolocation");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding (simple mock - replace dengan real service)
        const reversedCity = await getCityFromCoordinates(latitude, longitude);
        
        onLocationFound(latitude, longitude, reversedCity);
        setLoading(false);
      },
      (err) => {
        let msg = "Gagal mendapatkan lokasi";
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "Izin lokasi ditolak. Silakan aktifkan lokasi di pengaturan browser.";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "Informasi lokasi tidak tersedia.";
            break;
          case err.TIMEOUT:
            msg = "Waktu permintaan lokasi habis.";
            break;
        }
        
        setError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    try {
      // Gunakan OpenStreetMap Nominatim reverse geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error();
      
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || "Lokasi Anda";
      return city;
    } catch {
      return "Lokasi Anda";
    }
  };

  return (
    <button
      onClick={handleGeolocate}
      disabled={loading}
      className="rounded-lg bg-surface-card px-4 py-2 text-sm font-medium text-text shadow-card hover:bg-surface-container transition-colors disabled:opacity-50"
    >
      {loading ? "Mengambil lokasi..." : "Gunakan lokasi saya"}
    </button>
  );
};
