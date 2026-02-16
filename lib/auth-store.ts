import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "1d";

export async function createUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
    },
  });
  return { id: user.id, email: user.email };
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return null;

  return { id: user.id, email: user.email };
}

export function createAuthToken(userId: string, email: string) {
  const payload = { sub: userId, email };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function validateAuthToken(token: string | null | undefined) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub?: string;
      email?: string;
    };
    if (!decoded.sub || !decoded.email) return null;
    return { id: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function revokeToken(_token: string) {
  // With JWT, revocation would require a denylist; omitted for this demo.
}
