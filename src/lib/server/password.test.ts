// @vitest-environment node
import { describe, expect, it } from "vitest";
import { checkSellerCredentials, hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the right password only", async () => {
    const hash = await hashPassword("crochet-is-cozy");
    expect(hash).toMatch(/^scrypt\.[\w-]+\.[\w-]+$/);
    expect(hash).not.toContain("$");
    expect(await verifyPassword("crochet-is-cozy", hash)).toBe(true);
    expect(await verifyPassword("crochet-is-cosy", hash)).toBe(false);
  });

  it("salts each hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt.a.b")).toBe(false);
    expect(await verifyPassword("x", "scrypt.abc.short")).toBe(false);
  });
});

describe("checkSellerCredentials", () => {
  it("signs in the configured seller, ignoring email case", async () => {
    const env = { SELLER_EMAIL: "Shop@Knit.test", SELLER_PASSWORD_HASH: await hashPassword("yarn-yarn-yarn") };
    expect(await checkSellerCredentials(" shop@knit.TEST ", "yarn-yarn-yarn", env)).toMatchObject({
      email: "shop@knit.test",
    });
    expect(await checkSellerCredentials("other@knit.test", "yarn-yarn-yarn", env)).toBeNull();
    expect(await checkSellerCredentials("shop@knit.test", "wrong", env)).toBeNull();
    expect(await checkSellerCredentials(undefined, undefined, env)).toBeNull();
  });

  it("lets nobody in when the account isn't configured", async () => {
    expect(await checkSellerCredentials("a@b.c", "", {})).toBeNull();
    expect(await checkSellerCredentials("a@b.c", "pw", { SELLER_EMAIL: "a@b.c" })).toBeNull();
  });
});
