import crypto from "node:crypto";
import { env } from "./env";

/**
 * AES-256-GCM helpers for secrets at rest (AI provider keys).
 * Key is derived from AUTH_SECRET so no extra env var is needed.
 */
function key(): Buffer {
  const secret = env().AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required to encrypt settings");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${enc.toString("base64url")}.${tag.toString("base64url")}`;
}

export function decrypt(payload: string): string {
  if (!payload.startsWith("v1.")) return payload; // legacy/plain
  const [, ivB64, dataB64, tagB64] = payload.split(".");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(ivB64, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Constant-time compare of two strings. */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}
