import { useState, useEffect } from "react";
import {
  detectLocationFromBrowser,
  detectLocationFromIP,
  getLocationFromStorage,
  saveLocationToStorage,
  LocationData,
} from "@/lib/location";

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(
    getLocationFromStorage()
  );
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const autoDetect = async () => {
      if (location) return;

      setDetecting(true);

      let detected = await detectLocationFromIP();

      if (!detected) {
        detected = await detectLocationFromBrowser();
      }

      if (detected) {
        setLocation(detected);
        saveLocationToStorage(detected);
      }

      setDetecting(false);
    };

    autoDetect();
  }, [location]);

  const updateLocation = (newLocation: LocationData) => {
    setLocation(newLocation);
    saveLocationToStorage(newLocation);
  };

  const clearLocation = () => {
    setLocation(null);
  };

  const refetchLocation = async () => {
    setDetecting(true);
    const detected = await detectLocationFromBrowser();
    if (detected) {
      updateLocation(detected);
    }
    setDetecting(false);
  };

  return {
    location,
    detecting,
    updateLocation,
    clearLocation,
    refetchLocation,
  };
}
