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
        userId: user.id,
      },
      include: { rating: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (err) {
    console.error("[GET /api/trips/[id]]", err);
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

    const trip = await prisma.trip.updateMany({
      where: { id, userId: user.id },
      data: { status: parsed.data.status },
    });

    if (trip.count === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const updated = await prisma.trip.findUnique({
      where: { id },
    });

    return NextResponse.json({ trip: updated });
  } catch (err) {
    console.error("[PATCH /api/trips/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}
