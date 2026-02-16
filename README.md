# Vandi 🚕  
A smart ride-booking web app with precise map-based pickup & drop selection.

Vandi is a full-stack Next.js application that allows users to book rides by selecting pickup and destination locations directly on an interactive map. The system is designed with a real-world ride-hailing UX approach, focusing on accuracy and usability instead of depending entirely on exact building name detection.

Instead of forcing perfect building matches, the app:
- Shows nearby suggestions
- Allows manual pin adjustment
- Guides users to drag the pin to the exact entrance if needed

This mirrors how modern ride apps handle imperfect mapping data.

------------------------------------------------------------

✨ KEY FEATURES

🗺 Smart Map UX
- Interactive map using OpenStreetMap
- Location search with suggestions
- Nearby area fallback if building name is not found
- Draggable marker for precise pickup/drop entrance
- Helper message:
  "Can’t find your building? Drag the pin to exact entrance."

🚗 Booking Flow
- Pickup and drop selection
- Distance calculation
- Fare estimation
- Ride history
- Ratings system
- Authentication (Login / Signup)
- Profile management

🧠 Real-World UX Philosophy
- Works even when exact buildings aren’t indexed
- Stores precise latitude and longitude
- Avoids search failures due to imperfect map data
- Designed for production-like behavior

------------------------------------------------------------

🛠 TECH STACK

Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Maps & Location:
- Leaflet
- OpenStreetMap
- Nominatim (Geocoding)
- OpenRouteService (Routing & Distance)

Backend:
- PostgreSQL
- Prisma ORM

------------------------------------------------------------

🚀 GETTING STARTED

1️⃣ Install dependencies

npm install

------------------------------------------------------------

2️⃣ Environment Variables

Create a .env file in the root directory:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/vandi"
NEXT_PUBLIC_ORS_API_KEY=your_openrouteservice_api_key

Replace YOUR_PASSWORD and the API key with your actual values.

------------------------------------------------------------

3️⃣ Setup Database

Ensure PostgreSQL is running.

Then run:

npx prisma migrate dev

This creates the required database tables.

------------------------------------------------------------

4️⃣ Run the Development Server

npm run dev

Open in your browser:

http://localhost:3000

------------------------------------------------------------

📁 PROJECT STRUCTURE

app/                -> App Router pages and API routes
components/         -> Reusable UI and map components
hooks/              -> Custom React hooks
lib/                -> Utility functions and helpers
prisma/             -> Prisma schema and migrations
public/             -> Static assets and media files

------------------------------------------------------------

🧭 HOW LOCATION SELECTION WORKS

1. User searches for pickup or drop location.
2. App displays nearby suggestions (not strict building-only matches).
3. Map zooms into the selected area.
4. A draggable marker appears.
5. User can drag the pin to the exact entrance.
6. Reverse geocoding updates the formatted address.
7. Coordinates are saved for booking.

This ensures building-level precision even when map data is incomplete.

------------------------------------------------------------

📌 WHY THIS UX MATTERS

Free map datasets do not always contain:
- Exact apartment names
- Newly constructed buildings
- Correct building tags

By allowing manual pin adjustment:
- Accuracy increases
- Booking friction decreases
- User trust improves
- The system behaves like real ride-hailing apps

------------------------------------------------------------

📚 RESOURCES

Next.js: https://nextjs.org/docs  
Prisma: https://www.prisma.io/docs  
Leaflet: https://leafletjs.com  
OpenRouteService: https://openrouteservice.org  

------------------------------------------------------------

🧪 PROJECT STATUS

Actively developed.  
Core booking and map functionality implemented.  
Backend and pricing logic evolving.

------------------------------------------------------------

📄 LICENSE

MIT License
