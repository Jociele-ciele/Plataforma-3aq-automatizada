"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeEncryptedFile = writeEncryptedFile;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_js_1 = require("../config.js");
const ALGO = "aes-256-gcm";
function key() {
    const hex = config_js_1.config.encryptionKeyHex?.trim();
    if (!hex || hex.length < 64)
        return null;
    return Buffer.from(hex, "hex");
}
/**Encripta ficheiro em disco (LGPD — repouso). Se ENCRYPTION_KEY não estiver definida, grava sem encriptar (apenas dev). */
async function writeEncryptedFile(dir, originalName, buffer) {
    await fs_1.promises.mkdir(dir, { recursive: true });
    const id = crypto_1.default.randomUUID();
    const ext = path_1.default.extname(originalName) || ".bin";
    const fileName = `${id}${ext}`;
    const fullPath = path_1.default.join(dir, fileName);
    const k = key();
    if (!k) {
        await fs_1.promises.writeFile(fullPath, buffer);
        return fileName;
    }
    const iv = crypto_1.default.randomBytes(12);
    const cipher = crypto_1.default.createCipheriv(ALGO, k, iv);
    const enc = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, tag, enc]);
    await fs_1.promises.writeFile(fullPath + ".enc", payload);
    return `${fileName}.enc`;
}
//# sourceMappingURL=fileCrypto.js.map