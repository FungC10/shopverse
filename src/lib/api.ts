import { CurrentWeather, Forecast, GeoPoint, Units } from './types';

const BASE = 'https://api.openweathermap.org';
const KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;

export async function searchCity(q: string): Promise<GeoPoint[]> {
  const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed city search');
  const rows = await res.json();
  return rows.map((r: any) => ({ name: r.name, country: r.country, lat: r.lat, lon: r.lon }));
}

export async function getCurrent(lat: number, lon: number, units: Units): Promise<CurrentWeather> {
  const url = `${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed current weather');
  return res.json();
}

export async function getForecast(lat: number, lon: number, units: Units): Promise<Forecast> {
  const url = `${BASE}/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed forecast');
  return res.json();
}

