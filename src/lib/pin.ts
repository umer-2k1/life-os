import crypto from "node:crypto";

const KEYLEN = 64;
const SALT = 16;

/** scrypt hash: scrypt$<saltHex>$<hashHex> */
export function hashPin(pin: string): string {
  const salt = crypto.randomBytes(SALT);
  const hash = crypto.scryptSync(pin, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPinHash(pin: string, stored?: string | null): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(pin, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function isSixDigitPin(value: string): boolean {
  return /^\d{6}$/.test(value);
}
