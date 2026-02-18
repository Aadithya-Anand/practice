import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAuthToken } from "@/lib/auth-store";
import { prisma } from "@/lib/db";

/**
 * POST /api/driver/trips/[id]/accept
 * Driver accepts a trip
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const profile = await prisma.driverProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Driver profile not found" }, { status: 404 });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        status: "SEARCHING",
        driverId: null,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Trip not available or already accepted" },
        { status: 404 }
      );
    }

    await prisma.trip.update({
      where: { id },
      data: { driverId: user.id, status: "ACCEPTED" },
    });

    const updated = await prisma.trip.findUnique({
      where: { id },
      include: { rating: true },
    });

    return NextResponse.json({ trip: updated });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("POST /api/driver/trips/[id]/accept", err);
    return NextResponse.json(
      { error: "Failed to accept trip" },
      { status: 500 }
    );
  }
}
