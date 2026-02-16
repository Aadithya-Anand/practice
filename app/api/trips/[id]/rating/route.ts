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
      include: { rating: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
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

    return NextResponse.json({ rating }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/trips/[id]/rating]", err);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
