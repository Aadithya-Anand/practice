import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { validateAuthToken } from "@/lib/auth-store";
import { prisma } from "@/lib/db";
import { isValidCoordinate, calculateFare, type VehicleType } from "@/lib/pricing";
import { validateBookingLocations } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeAddress } from "@/lib/sanitize";

// -----------------------------------------------------------------------------
// Validation schemas
// -----------------------------------------------------------------------------
const createTripSchema = z.object({
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  dropLat: z.number().min(-90).max(90),
  dropLng: z.number().min(-180).max(180),
  pickupAddress: z.string().min(1),
  dropAddress: z.string().min(1),
  pickupAddressRaw: z.union([z.record(z.string(), z.any()), z.null()]).optional(),
  dropAddressRaw: z.union([z.record(z.string(), z.any()), z.null()]).optional(),
  distanceKm: z.number().min(0),
  durationMin: z.number().min(0),
  fare: z.number().min(0),
  vehicleType: z.enum(["MINI", "SEDAN", "SUV"]),
  rideNotes: z.string().max(500).optional(),
  scheduledAt: z.union([z.string(), z.null()]).optional(),
  promoCode: z.string().max(50).optional(),
});

// -----------------------------------------------------------------------------
// POST /api/trips - Create new trip
// -----------------------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value ?? null;
    const user = validateAuthToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { allowed, retryAfter } = checkRateLimit(`trips:${user.id}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined }
      );
    }

    const body = await request.json().catch(() => null);
    if (body == null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    let parsed;
    try {
      parsed = createTripSchema.safeParse(body);
    } catch (parseErr) {
      const { logApiError } = await import("@/lib/logger");
      logApiError("POST /api/trips", parseErr, { phase: "parse" });
      return NextResponse.json(
        { error: "Invalid trip data" },
        { status: 400 }
      );
    }
    if (!parsed.success) {
      const details = "issues" in parsed.error ? (parsed.error as { issues: unknown[] }).issues : [];
      return NextResponse.json(
        { error: "Invalid trip data", details },
        { status: 400 }
      );
    }

    const { pickupLat, pickupLng, dropLat, dropLng, pickupAddressRaw, dropAddressRaw, distanceKm, durationMin, fare, vehicleType, rideNotes, scheduledAt, promoCode } = parsed.data;
    const pickupAddress = sanitizeAddress(parsed.data.pickupAddress);
    const dropAddress = sanitizeAddress(parsed.data.dropAddress);

    const validation = validateBookingLocations(
      pickupLat,
      pickupLng,
      dropLat,
      dropLng,
      pickupAddress,
      dropAddress
    );
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    if (!isValidCoordinate(pickupLat, pickupLng) || !isValidCoordinate(dropLat, dropLng)) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    // Server-side fare validation (optional - ensures client didn't tamper)
    const serverFare = calculateFare({
      distanceKm,
      vehicleType: vehicleType as VehicleType,
    });
    const validatedFare = Math.min(fare, serverFare.totalFare * 1.1); // Allow 10% tolerance

    if (!prisma.trip) {
      const { logApiError } = await import("@/lib/logger");
      logApiError("POST /api/trips", new Error("prisma.trip undefined"), { hint: "Run npx prisma generate" });
      return NextResponse.json(
        { error: "Database not configured. Run: npx prisma generate && npx prisma migrate dev" },
        { status: 500 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        pickupLat,
        pickupLng,
        dropLat,
        dropLng,
        pickupAddress,
        dropAddress,
        pickupAddressRaw: pickupAddressRaw ? JSON.parse(JSON.stringify(pickupAddressRaw)) : undefined,
        dropAddressRaw: dropAddressRaw ? JSON.parse(JSON.stringify(dropAddressRaw)) : undefined,
        distanceKm,
        durationMin,
        fare: validatedFare,
        vehicleType,
        status: "SEARCHING",
        rideNotes: rideNotes || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        promoCode: promoCode || undefined,
      },
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("POST /api/trips", err);
    const message = err instanceof Error ? err.message : "Failed to create trip";
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? message : "Failed to create trip" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// GET /api/trips - List trips (filter by user if authenticated)
// -----------------------------------------------------------------------------
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value ?? null;
    const user = validateAuthToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ trips });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("GET /api/trips", err);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
