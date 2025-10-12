export interface LocationData {
  city: string;
  state: string;
  formatted: string; // "San Francisco, CA"
  latitude?: number;
  longitude?: number;
}

export async function detectLocationFromBrowser(): Promise<LocationData | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
          );
          const data = await response.json();

          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "";
          const state = data.address?.state || "";

          resolve({
            city,
            state,
            formatted: `${city}${state ? ", " + state : ""}`,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } catch {
          resolve(null);
        }
      },
      () => resolve(null)
    );
  });
}

export async function detectLocationFromIP(): Promise<LocationData | null> {
  // Future enhancement - create edge function for IP geolocation
  return null;
}

const LOCATION_STORAGE_KEY = "circle_pro_location";

export function saveLocationToStorage(location: LocationData): void {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function getLocationFromStorage(): LocationData | null {
  const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearLocationFromStorage(): void {
  localStorage.removeItem(LOCATION_STORAGE_KEY);
}
