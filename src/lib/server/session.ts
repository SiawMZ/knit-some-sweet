import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** The signed-in seller, or a redirect to the login page. Call it in every admin page and action. */
export async function requireSeller() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session.user;
}
