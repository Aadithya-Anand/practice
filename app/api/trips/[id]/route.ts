import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { validateAuthToken } from "@/lib/auth-store";
import { prisma } from "@/lib/db";

const VALID_STATUSES = ["SEARCHING", "ACCEPTED", "ARRIVING", "STARTED", "COMPLETED", "CANCELLED"] as const;

const patchTripSchema = z.object({
  status: z.enum(VALID_STATUSES),
});

// -----------------------------------------------------------------------------
// GET /api/trips/[id] - Fetch single trip
// -----------------------------------------------------------------------------
export async function GET(
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

    const { id } = await params;
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        OR: [{ userId: user.id }, { driverId: user.id }],
      },
      include: { rating: true, driver: { include: { driverProfile: true } } },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("GET /api/trips/[id]", err);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// PATCH /api/trips/[id] - Update trip status
// -----------------------------------------------------------------------------
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value ?? null;
    const user = validateAuthToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = patchTripSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status", validStatuses: VALID_STATUSES },
        { status: 400 }
      );
    }

    const existing = await prisma.trip.findFirst({
      where: { id, OR: [{ userId: user.id }, { driverId: user.id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const newStatus = parsed.data.status;

    // Rider can only cancel
    if (existing.userId === user.id) {
      if (newStatus !== "CANCELLED") {
        return NextResponse.json(
          { error: "Riders can only cancel trips" },
          { status: 403 }
        );
      }
    }

    // Driver can set ACCEPTED, ARRIVING, STARTED, COMPLETED (not CANCELLED for driver - rider cancels)
    if (existing.driverId === user.id) {
      if (newStatus === "CANCELLED") {
        return NextResponse.json(
          { error: "Rider must cancel the trip" },
          { status: 403 }
        );
      }
    }

    await prisma.trip.update({
      where: { id },
      data: { status: newStatus },
    });

    const updated = await prisma.trip.findUnique({
      where: { id },
      include: { rating: true, driver: { include: { driverProfile: true } } },
    });

    return NextResponse.json({ trip: updated });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("PATCH /api/trips/[id]", err);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}
