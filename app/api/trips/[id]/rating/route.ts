import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { validateAuthToken } from "@/lib/auth-store";
import { prisma } from "@/lib/db";

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
});

export async function POST(
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

    const { id: tripId } = await params;
    const body = await request.json().catch(() => null);
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid rating (1-5 stars)" },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: user.id },
      include: { rating: true, driver: { include: { driverProfile: true } } },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only rate completed trips" },
        { status: 400 }
      );
    }

    if (trip.rating) {
      return NextResponse.json(
        { error: "Trip already rated" },
        { status: 400 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        tripId,
        stars: parsed.data.stars,
      },
    });

    // Update driver's average rating when rating is submitted
    if (trip.driverId && trip.driver?.driverProfile) {
      const driverRatings = await prisma.rating.findMany({
        where: {
          trip: { driverId: trip.driverId },
        },
        select: { stars: true },
      });
      const avg = driverRatings.reduce((s, r) => s + r.stars, 0) / driverRatings.length;
      await prisma.driverProfile.update({
        where: { userId: trip.driverId },
        data: { rating: Math.round(avg * 10) / 10 },
      });
    }

    return NextResponse.json({ rating }, { status: 201 });
  } catch (err) {
    (await import("@/lib/logger")).logApiError("POST /api/trips/[id]/rating", err);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
