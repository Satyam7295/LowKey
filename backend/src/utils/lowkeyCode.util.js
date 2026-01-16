import crypto from "crypto";

export function generateLowkeyCode(userId, createdAt) {
  const secret = process.env.LOWKEY_SECRET || "default-secret-key";

  const entropy = `${userId}${createdAt}${secret}`;

  const hash = crypto
    .createHash("sha256")
    .update(entropy)
    .digest("hex");

  const hexPart = hash.substring(0, 8);
  const number = parseInt(hexPart, 16);

  const lowkeyCode = number % 1_000_000;

  return lowkeyCode.toString().padStart(6, "0");
}
