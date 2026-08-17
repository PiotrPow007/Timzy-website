import { randomBytes, randomUUID, webcrypto } from "node:crypto";
import { encryptJson, passwordHash, toBase64Url } from "../lib/commerce/security";

if (!globalThis.crypto) Object.defineProperty(globalThis, "crypto", { value: webcrypto });

const email = (process.env.TIMZY_ADMIN_EMAIL ?? "").trim().toLowerCase();
const name = (process.env.TIMZY_ADMIN_NAME ?? "").trim();
const password = process.env.TIMZY_ADMIN_PASSWORD ?? "";
const totp = (process.env.TIMZY_ADMIN_TOTP_SECRET ?? "").replace(/\s+/g, "").toUpperCase();
const encryptionKey = process.env.DATA_ENCRYPTION_KEY ?? "";
const role = process.env.TIMZY_ADMIN_ROLE === "ADMIN" ? "ADMIN" : "SUPER_ADMIN";

if (!/^\S+@\S+\.\S+$/.test(email) || !name || password.length < 16 || !/^[A-Z2-7]{16,}$/.test(totp) || !encryptionKey) {
  console.error("Set TIMZY_ADMIN_EMAIL, TIMZY_ADMIN_NAME, TIMZY_ADMIN_PASSWORD (16+ characters), TIMZY_ADMIN_TOTP_SECRET and DATA_ENCRYPTION_KEY. No values are written to the repository.");
  process.exit(1);
}

const salt = toBase64Url(randomBytes(16));
const hash = await passwordHash(password, salt, 600_000);
const encryptedTotp = await encryptJson(totp, encryptionKey);
const sqlString = (value: string) => `'${value.replace(/'/g, "''")}'`;
console.log(`INSERT INTO admin_users (id,email,display_name,role,password_algorithm,password_salt,password_hash,password_iterations,totp_secret_encrypted,mfa_enabled,status) VALUES (${sqlString(randomUUID())},${sqlString(email)},${sqlString(name)},${sqlString(role)},'PBKDF2-SHA256',${sqlString(salt)},${sqlString(hash)},600000,${sqlString(encryptedTotp)},1,'ACTIVE');`);
