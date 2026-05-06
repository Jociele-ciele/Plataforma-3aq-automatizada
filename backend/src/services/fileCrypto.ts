import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const ALGO = "aes-256-gcm";

function key(): Buffer | null {
  const hex = config.encryptionKeyHex?.trim();
  if (!hex || hex.length < 64) return null;
  return Buffer.from(hex, "hex");
}

/**Encripta ficheiro em disco (LGPD — repouso). Se ENCRYPTION_KEY não estiver definida, grava sem encriptar (apenas dev). */
export async function writeEncryptedFile(dir: string, originalName: string, buffer: Buffer): Promise<string> {
  await fs.mkdir(dir, { recursive: true });
  const id = crypto.randomUUID();
  const ext = path.extname(originalName) || ".bin";
  const fileName = `${id}${ext}`;
  const fullPath = path.join(dir, fileName);
  const k = key();
  if (!k) {
    await fs.writeFile(fullPath, buffer);
    return fileName;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, k, iv);
  const enc = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, enc]);
  await fs.writeFile(fullPath + ".enc", payload);
  return `${fileName}.enc`;
}
