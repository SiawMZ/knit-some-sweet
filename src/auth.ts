import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { checkSellerCredentials } from "@/lib/server/password";

/** Paths under /admin that anyone may open. */
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export const authConfig = {
  // Self-hosted (`next start`), so trust the Host header for callback URLs.
  trustHost: true,
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  logger: {
    // A wrong password is expected, not a server error.
    error: (error) => {
      if (error.name !== "CredentialsSignin") console.error(error);
    },
  },
  providers: [
    // A single seller account, configured with SELLER_EMAIL and SELLER_PASSWORD_HASH.
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      authorize: (credentials) =>
        checkSellerCredentials(credentials?.email, credentials?.password, {
          SELLER_EMAIL: process.env.SELLER_EMAIL,
          SELLER_PASSWORD_HASH: process.env.SELLER_PASSWORD_HASH,
        }),
    }),
  ],
  callbacks: {
    // Used by proxy.ts: signed-out visitors to /admin are sent to the login page.
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!pathname.startsWith("/admin") || PUBLIC_ADMIN_PATHS.includes(pathname)) return true;
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
