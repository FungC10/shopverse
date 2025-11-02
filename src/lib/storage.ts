import { GeoPoint, Units } from './types';

const RECENT_KEY = 'weatherflow:recent';
const UNITS_KEY = 'weatherflow:units';

export function getRecentSearches(): GeoPoint[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RECENT_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveRecentSearch(point: GeoPoint): void {
  if (typeof window === 'undefined') return;
  const recent = getRecentSearches();
  const filtered = recent.filter(r => !(r.lat === point.lat && r.lon === point.lon));
  const updated = [point, ...filtered].slice(0, 6); // max 6
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export function getUnits(): Units {
  if (typeof window === 'undefined') return 'metric';
  const stored = localStorage.getItem(UNITS_KEY);
  return (stored as Units) || 'metric';
}

export function saveUnits(units: Units): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(UNITS_KEY, units);
}

