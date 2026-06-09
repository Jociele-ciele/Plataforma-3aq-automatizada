"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptBuffer = encryptBuffer;
exports.decryptBuffer = decryptBuffer;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const ALGO = "aes-256-gcm";
const IV_LEN = 12;
// Criptografa um Buffer (usado para currículos em disco).
function encryptBuffer(buffer) {
    const iv = crypto_1.default.randomBytes(IV_LEN);
    const cipher = crypto_1.default.createCipheriv(ALGO, Buffer.from(env_1.env.ENCRYPTION_KEY), iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    // formato no disco: [iv (12) | tag (16) | conteúdo]
    return Buffer.concat([iv, tag, encrypted]);
}
function decryptBuffer(buffer) {
    const iv = buffer.subarray(0, IV_LEN);
    const tag = buffer.subarray(IV_LEN, IV_LEN + 16);
    const data = buffer.subarray(IV_LEN + 16);
    const decipher = crypto_1.default.createDecipheriv(ALGO, Buffer.from(env_1.env.ENCRYPTION_KEY), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}
//# sourceMappingURL=encryption.js.map