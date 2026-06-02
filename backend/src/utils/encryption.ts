import crypto from "crypto";
import { env } from "../config/env";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;

// Criptografa um Buffer (usado para currículos em disco).
export function encryptBuffer(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(env.ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  // formato no disco: [iv (12) | tag (16) | conteúdo]
  return Buffer.concat([iv, tag, encrypted]);
}

export function decryptBuffer(buffer: Buffer): Buffer {
  const iv = buffer.subarray(0, IV_LEN);
  const tag = buffer.subarray(IV_LEN, IV_LEN + 16);
  const data = buffer.subarray(IV_LEN + 16);
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(env.ENCRYPTION_KEY), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
