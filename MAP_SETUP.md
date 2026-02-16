# Ride Booking Map - Setup Instructions

## Stack (All Free, No Google)

- **OpenStreetMap** - Map tiles
- **Leaflet + react-leaflet** - Map rendering
- **OpenRouteService** - Route/distance API
- **Nominatim** - Geocoding search (no key needed)

## 1. Install Dependencies

Already installed. If needed:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

## 2. OpenRouteService API Key (Required for Routes)

1. Sign up at https://openrouteservice.org/dev/#/signup (free)
2. Create a project and copy your API key
3. Add to `.env.local`:

```
NEXT_PUBLIC_OPENROUTE_API_KEY="your-key-here"
```

**Note:** `NEXT_PUBLIC_` prefix is required for client-side access.

Without this key, the map works but routes won't be drawn and distance/fare won't calculate.

## 3. Run the Project

```bash
npm run dev
```

Open http://localhost:3000, log in, go to Book.

## 4. How It Works

- **First click** on map = Pickup
- **Second click** = Drop
- **Third click** = Reset both
- **Search** = Use Nominatim (free, no key) for address lookup
- **Route** = OpenRouteService draws the path and calculates distance
- **Fare** = baseFare (₹40) + distance × perKmRate (₹12)

## 5. File Structure

```
components/map/
  MapView.tsx    - Main map + search + fare card
  MapContent.tsx - Leaflet map (dynamic import)
  SearchBox.tsx  - Nominatim geocoding with debounce
```
