export function formatTemp(temp: number, units: 'metric' | 'imperial'): string {
  return `${Math.round(temp)}°${units === 'metric' ? 'C' : 'F'}`;
}

export function formatWind(speed: number, units: 'metric' | 'imperial'): string {
  const unit = units === 'metric' ? 'm/s' : 'mph';
  return `${speed.toFixed(1)} ${unit}`;
}

export function formatDay(dt: number, timezoneOffset: number): string {
  const date = new Date((dt + timezoneOffset) * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatTime(dt: number, timezoneOffset: number): string {
  const date = new Date((dt + timezoneOffset) * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

