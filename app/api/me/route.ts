import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { validateAuthToken } from "@/lib/auth-store";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value ?? null;

  const user = validateAuthToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
  });
}

