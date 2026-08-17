const encoder = new TextEncoder();
const decoder = new TextDecoder();

function source(value: Uint8Array): ArrayBuffer {
  return value.slice().buffer as ArrayBuffer;
}

export function toBase64Url(value: Uint8Array): string {
  let binary = "";
  value.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function randomToken(bytes = 32): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  return toBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", source(bytes))));
}

export async function hmacSha256(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

export function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

function encryptionKey(secret: string): Uint8Array {
  const raw = fromBase64Url(secret);
  if (raw.byteLength !== 32) throw new Error("DATA_ENCRYPTION_KEY must be a base64url-encoded 32-byte key");
  return raw;
}

export async function encryptBytes(plaintext: Uint8Array, secret: string): Promise<{ ciphertext: Uint8Array; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", source(encryptionKey(secret)), "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: source(iv) }, key, source(plaintext)));
  return { ciphertext, iv: toBase64Url(iv) };
}

export async function decryptBytes(ciphertext: Uint8Array, iv: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", source(encryptionKey(secret)), "AES-GCM", false, ["decrypt"]);
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: source(fromBase64Url(iv)) }, key, source(ciphertext)));
}

export async function encryptJson(value: unknown, secret: string): Promise<string> {
  const { ciphertext, iv } = await encryptBytes(encoder.encode(canonicalJson(value)), secret);
  return `${iv}.${toBase64Url(ciphertext)}`;
}

export async function decryptJson<T>(value: string, secret: string): Promise<T> {
  const [iv, ciphertext, extra] = value.split(".");
  if (!iv || !ciphertext || extra) throw new Error("Invalid encrypted value");
  return JSON.parse(decoder.decode(await decryptBytes(fromBase64Url(ciphertext), iv, secret))) as T;
}

export async function passwordHash(password: string, salt: string, iterations = 600_000): Promise<string> {
  const key = await crypto.subtle.importKey("raw", source(encoder.encode(password)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: source(fromBase64Url(salt)), iterations }, key, 256);
  return toBase64Url(new Uint8Array(bits));
}

export async function verifyPassword(password: string, salt: string, iterations: number, expected: string): Promise<boolean> {
  return timingSafeEqual(await passwordHash(password, salt, iterations), expected);
}

function decodeBase32(secret: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const character of clean) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Invalid TOTP secret");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  return Uint8Array.from(bytes);
}

export async function totpCode(secret: string, timestamp = Date.now(), stepSeconds = 30): Promise<string> {
  let counter = Math.floor(timestamp / 1000 / stepSeconds);
  const message = new Uint8Array(8);
  for (let index = 7; index >= 0; index -= 1) { message[index] = counter & 0xff; counter = Math.floor(counter / 256); }
  const key = await crypto.subtle.importKey("raw", source(decodeBase32(secret)), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, source(message)));
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(binary % 1_000_000).padStart(6, "0");
}

export async function verifyTotp(secret: string, code: string, timestamp = Date.now()): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  for (const offset of [-30_000, 0, 30_000]) if (timingSafeEqual(await totpCode(secret, timestamp + offset), code)) return true;
  return false;
}

export function parseCookies(request: Request): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator > 0) result[part.slice(0, separator).trim()] = decodeURIComponent(part.slice(separator + 1).trim());
  }
  return result;
}

export function secureCookie(name: string, value: string, options: { maxAge?: number; httpOnly?: boolean; secure?: boolean } = {}): string {
  const attributes = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Strict"];
  if (options.secure !== false) attributes.push("Secure");
  if (options.httpOnly !== false) attributes.push("HttpOnly");
  if (typeof options.maxAge === "number") attributes.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  return attributes.join("; ");
}

export function requestIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function ipEvidence(request: Request, secret: string): Promise<string> {
  return hmacSha256(requestIp(request), secret);
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
