# Vandi - Production Architecture

## Folder Structure

```
vandi/
├── app/
│   ├── api/
│   │   ├── auth/           # Login, signup, logout
│   │   └── trips/          # Trip CRUD + rating
│   │       ├── route.ts    # POST (create), GET (list)
│   │       └── [id]/
│   │           ├── route.ts    # GET, PATCH (status)
│   │           └── rating/    # POST (submit rating)
│   ├── book/               # Booking page (map + form)
│   ├── ride/[rideid]/      # Active trip with driver simulation
│   ├── rating/[rideid]/    # Post-trip rating
│   └── history/            # Trip history
├── components/
│   ├── map/                # MapView, MapContent, SearchBox
│   ├── booking/            # BookingForm, RideSelector
│   └── ui/                 # shadcn components
├── hooks/
│   └── useDriverSimulation.ts  # Trip lifecycle simulation
├── lib/
│   ├── api.ts              # API service layer (tripsApi)
│   ├── auth-store.ts       # Auth + JWT
│   ├── db.ts               # Prisma client
│   ├── pricing.ts          # Fare calculation engine
│   └── rate-limit.ts       # Rate limiting
└── prisma/
    └── schema.prisma       # User, Trip, Rating
```

## Data Flow

1. **Booking**: MapView (pickup/drop) → MapData → BookingForm → tripsApi.create() → /ride/[id]
2. **Trip lifecycle**: useDriverSimulation() → SEARCHING → ACCEPTED → ARRIVING → STARTED → COMPLETED
3. **Rating**: /rating/[id] → POST /api/trips/[id]/rating

## Key Design Decisions

- **Pricing engine** (`lib/pricing.ts`): Centralized fare calculation with surge (night/peak)
- **API layer** (`lib/api.ts`): All fetch logic isolated; no business logic in UI
- **Driver simulation** (`hooks/useDriverSimulation`): Isolated hook; auto-advances status
- **Map**: Dynamic import to avoid Leaflet SSR issues

## Security

- API keys in `.env` (NEXT_PUBLIC_OPENROUTE_API_KEY for client)
- JWT auth via httpOnly cookie
- Zod validation on all API inputs
- Coordinate validation in pricing engine
