import { NextResponse } from "next/server";
import { z } from "zod";

import { createDriver } from "@/lib/auth-store";
import { rateLimit } from "@/lib/rate-limit";

const driverSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  vehicleType: z.enum(["MINI", "SEDAN", "SUV"]),
  vehicleNumber: z.string().min(1),
  licenseNumber: z.string().min(1),
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
  const parsed = driverSignupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signup data", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const user = await createDriver(parsed.data.email, parsed.data.password, {
      name: parsed.data.name,
      phone: parsed.data.phone,
      vehicleType: parsed.data.vehicleType,
      vehicleNumber: parsed.data.vehicleNumber,
      licenseNumber: parsed.data.licenseNumber,
    });
    return NextResponse.json(
      { user: { id: user.id, email: user.email, role: "driver" } },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "User already exists") {
      return NextResponse.json(
        { error: "Account already exists with this email" },
        { status: 400 },
      );
    }
    console.error("[POST /api/auth/driver-signup]", err);
    const devError = process.env.NODE_ENV === "development" ? message : undefined;
    return NextResponse.json(
      {
        error: "Could not create driver account. Please try again.",
        ...(devError && { details: devError }),
      },
      { status: 500 },
    );
  }
}
