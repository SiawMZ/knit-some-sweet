/**
 * Keeps signed-out visitors out of /admin. This is a first line only: every
 * admin page and Server Action checks the session again with requireSeller().
 */
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/admin/:path*"],
};
