/** Usage: npm run hash-password -- "the seller's password"  → prints SELLER_PASSWORD_HASH */
import { hashPassword } from "../src/lib/server/password";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Usage: npm run hash-password -- "a password of at least 8 characters"');
  process.exit(1);
}
hashPassword(password).then((hash) => console.log(`SELLER_PASSWORD_HASH="${hash}"`));
