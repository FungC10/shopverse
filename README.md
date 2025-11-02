# WeatherFlow

Minimal, elegant, city-first weather app with optional map browse mode.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your OpenWeatherMap API key:
```bash
NEXT_PUBLIC_OWM_API_KEY=your_api_key_here
NEXT_PUBLIC_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_TILE_ATTRIBUTION=© OpenStreetMap contributors
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query
- Leaflet / React Leaflet
- Framer Motion
- React Hook Form

## Project Structure

See `architecture.md` for detailed architecture documentation.

