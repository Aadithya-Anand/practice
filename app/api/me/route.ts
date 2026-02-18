import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { validateAuthToken, updateUser } from "@/lib/auth-store";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value ?? null;

  const user = validateAuthToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      driverProfile: {
        select: {
          id: true,
          name: true,
          vehicleType: true,
          vehicleNumber: true,
          isOnline: true,
          rating: true,
        },
      },
    },
  });

  const u = dbUser ?? { id: user.id, email: user.email, name: null, role: "rider", driverProfile: null };
  return NextResponse.json({
    user: {
      ...u,
      role: u.role ?? "rider",
    },
  });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value ?? null;

  const user = validateAuthToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : undefined;

  try {
    const updated = await updateUser(user.id, { name });
    return NextResponse.json({ user: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
