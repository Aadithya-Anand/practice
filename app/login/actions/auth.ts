"use server"; // This tells Next.js to run this code only on the server

import { cookies } from "next/headers";

import { createUser, validateUser, createAuthToken } from "@/lib/auth-store";

type LoginValues = {
  email: string;
  password: string;
};

type SignupValues = {
  email: string;
  password: string;
};

export async function loginAction(values: LoginValues) {
  const user = await validateUser(values.email, values.password);

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  const token = createAuthToken(user.id, user.email);

  const cookieStore = await cookies();
  cookieStore.set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  return {
    success: true,
    message: "Successfully authenticated!",
  };
}

export async function signupAction(values: SignupValues) {
  try {
    await createUser(values.email, values.password);

    return {
      success: true,
      message: "Your account has been created successfully!",
    };
  } catch {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }
}