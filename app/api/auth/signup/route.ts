import { NextResponse } from "next/server";
import { z } from "zod";

import { createUser } from "@/lib/auth-store";
import { rateLimit } from "@/lib/rate-limit";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`signup:${ip}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many sign up attempts. Please try again later." },
      {
        status: 429,
        headers: rl.retryAfter
          ? { "Retry-After": String(Math.ceil(rl.retryAfter / 1000)) }
          : {},
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signup data" },
      { status: 400 },
    );
  }

  try {
    const user = await createUser(parsed.data.email, parsed.data.password);
    return NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Account already exists with this email" },
      { status: 400 },
    );
  }
}

