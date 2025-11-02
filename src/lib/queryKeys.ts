export const queryKeys = {
  city: (q: string) => ['city', q] as const,
  current: (lat: number, lon: number, units: string) => ['current', lat, lon, units] as const,
  forecast: (lat: number, lon: number, units: string) => ['forecast', lat, lon, units] as const,
};

