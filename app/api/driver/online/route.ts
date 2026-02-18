import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAuthToken } from "@/lib/auth-store";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/driver/online
 * Toggle driver online/offline status
 */
export async function PATCH(request: Request) {
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

    const body = await request.json().catch(() => null);
    const isOnline = body?.isOnline === true;

    await prisma.driverProfile.update({
      where: { userId: user.id },
      data: { isOnline },
    });

    return NextResponse.json({ isOnline });
  } catch (err) {
    const { logApiError } = await import("@/lib/logger");
    logApiError("PATCH /api/driver/online", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
