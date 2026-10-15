import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, (err, key) => (err ? reject(err) : resolve(key))),
  );

/**
 * Hash a password as `scrypt.<salt>.<key>` (base64url). The format has no `$`,
 * so it can sit in a .env file without Next.js expanding it as a variable.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt.${salt.toString("base64url")}.${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, key] = stored.split(".");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const expected = Buffer.from(key, "base64url");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await derive(password, Buffer.from(salt, "base64url"));
  return timingSafeEqual(actual, expected);
}

export interface SellerEnv {
  SELLER_EMAIL?: string;
  SELLER_PASSWORD_HASH?: string;
}

/** A setting pasted with its .env quotes (easy to do in a host's dashboard) still works. */
const unquote = (value?: string) => value?.trim().replace(/^(["'])(.*)\1$/, "$2").trim();
/** The seller account if the email and password match the env config, otherwise null. */
export async function checkSellerCredentials(
  email: unknown,
  password: unknown,
  env: SellerEnv,
): Promise<{ id: string; email: string; name: string } | null> {
  const sellerEmail = unquote(env.SELLER_EMAIL)?.toLowerCase();
  const hash = unquote(env.SELLER_PASSWORD_HASH);
  if (!sellerEmail || !hash || typeof email !== "string" || typeof password !== "string") return null;
  // Check the password even when the email is wrong, so both take the same time.
  const passwordOk = await verifyPassword(password, hash);
  if (!passwordOk || email.trim().toLowerCase() !== sellerEmail) return null;
  return { id: "seller", email: sellerEmail, name: "knitsomesweet" };
}
