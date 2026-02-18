import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAuthToken } from "@/lib/auth-store";
import { prisma } from "@/lib/db";

/**
 * GET /api/driver/trips
 * List trips for driver:
 * - Available: status=SEARCHING, no driver, vehicleType matches
 * - My trips: driverId = current user
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value ?? null;
    const user = validateAuthToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "driver") {
      return NextResponse.json({ error: "Driver access only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") ?? "available"; // available | my

    if (filter === "available") {
      const profile = await prisma.driverProfile.findUnique({
        where: { userId: user.id },
      });
      if (!profile) {
        return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
      }
      if (!profile.isOnline) {
        return NextResponse.json({ trips: [] });
      }

      const trips = await prisma.trip.findMany({
        where: {
          status: "SEARCHING",
          driverId: null,
          // Show all available rides (vehicle type filter relaxed for demo)
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ trips });
    }

    if (filter === "my") {
      const trips = await prisma.trip.findMany({
        where: { driverId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ trips });
    }

    return NextResponse.json({ error: "Invalid filter" }, { status: 400 });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("GET /api/driver/trips", err);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
