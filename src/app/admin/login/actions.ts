"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(_prev: string | undefined, fd: FormData): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    // signIn redirects by throwing; only auth failures are handled here.
    if (error instanceof AuthError) {
      await new Promise((r) => setTimeout(r, 600)); // slow down password guessing a little
      return "That email and password don't match.";
    }
    throw error;
  }
}
