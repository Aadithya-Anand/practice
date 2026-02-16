# Building-Level Precision - Architecture

## Overview

The system uses Nominatim (OSM) for building-level geocoding with:
- **Reverse geocoding** (click/drag): zoom=18, addressdetails=1
- **Forward search**: bounded to Chennai, addressdetails=1

## Folder Structure

```
lib/
  geocoding.ts     # reverseGeocode(), forwardGeocode(), formatBuildingAddress()
  validation.ts   # isOnLand(), arePointsDistinct(), validateBookingLocations()

hooks/
  useDebounce.ts       # useDebounce(), useDebouncedCallback()
  useReverseGeocode.ts # fetchAddress(), retry, fallback

components/map/
  MapView.tsx      # Main map + SearchInput + state
  MapContent.tsx   # Leaflet map, draggable markers
  SearchInput.tsx  # Building-aware autocomplete
```

## Data Flow

1. **Map click** → reverseGeocode(lat, lng) → formattedAddress + rawAddress → update state
2. **Marker drag** → reverseGeocode(new lat, lng) → "Adjusting location..." → update
3. **Search** → forwardGeocode(query) with viewbox → select → zoom to 19, place marker
4. **Validation** → validateBookingLocations() before booking

## Address Format

Extracted from Nominatim: house_number, road, building, suburb, city, postcode.

Display: `"Flat 3B, Lakshmi Apartments, Adyar, Chennai"`

## Migration

```bash
npx prisma migrate dev --name building_precision
```

**Note:** If you have existing trips with `pickupAddr`/`dropAddr`, you may need to run a custom data migration first, or reset the database.
