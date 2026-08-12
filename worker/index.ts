/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { connect as connectTls, type TLSSocket } from "node:tls";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USERNAME?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM?: string;
  CONTACT_TO?: string;
  CAPTCHA_SECRET?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

type ContactPayload = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  industry?: unknown;
  message?: unknown;
  privacyAccepted?: unknown;
  website?: unknown;
  captchaAnswer?: unknown;
  captchaToken?: unknown;
  startedAt?: unknown;
  locale?: unknown;
};

const encoder = new TextEncoder();

function json(payload: Record<string, unknown>, status = 200) {
  return Response.json(payload, { status, headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

function base64Url(value: Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  return Buffer.from(bytes).toString("base64url");
}

async function captchaSignature(payload: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
}

async function createCaptcha(secret: string) {
  const random = crypto.getRandomValues(new Uint32Array(3));
  const a = 2 + (random[0] % 8);
  const b = 1 + (random[1] % 9);
  const data = JSON.stringify({ a, b, exp: Date.now() + 5 * 60_000, nonce: random[2].toString(36) });
  const encoded = base64Url(data);
  return { question: `${a} + ${b} =`, token: `${encoded}.${await captchaSignature(encoded, secret)}` };
}

function equalStrings(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

async function verifyCaptcha(token: string, answer: string, secret: string) {
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return false;
  const expected = await captchaSignature(encoded, secret);
  if (!equalStrings(signature, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { a?: number; b?: number; exp?: number };
    if (!Number.isInteger(data.a) || !Number.isInteger(data.b) || typeof data.exp !== "number" || data.exp < Date.now()) return false;
    return Number(answer) === Number(data.a) + Number(data.b);
  } catch {
    return false;
  }
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function wrapBase64(value: string) {
  const encoded = Buffer.from(value, "utf8").toString("base64");
  return encoded.match(/.{1,76}/g)?.join("\r\n") ?? encoded;
}

class SmtpConnection {
  private readonly socket: TLSSocket;
  private buffer = "";
  private lines: string[] = [];
  private responses: Array<{ code: number; text: string }> = [];
  private waiters: Array<(value: { code: number; text: string }) => void> = [];
  private failure: Error | null = null;

  constructor(socket: TLSSocket) {
    this.socket = socket;
    socket.on("data", (chunk) => this.receive(Buffer.from(chunk).toString("utf8")));
    socket.on("error", (error) => { this.failure = error; });
  }

  private receive(chunk: string) {
    this.buffer += chunk;
    let newline = this.buffer.indexOf("\r\n");
    while (newline >= 0) {
      const line = this.buffer.slice(0, newline);
      this.buffer = this.buffer.slice(newline + 2);
      this.lines.push(line);
      if (/^\d{3} /.test(line)) {
        const response = { code: Number(line.slice(0, 3)), text: this.lines.join("\n") };
        this.lines = [];
        const waiter = this.waiters.shift();
        if (waiter) waiter(response); else this.responses.push(response);
      }
      newline = this.buffer.indexOf("\r\n");
    }
  }

  async read(expected: number[]) {
    const response = this.responses.shift() ?? await Promise.race([
      new Promise<{ code: number; text: string }>((resolve) => this.waiters.push(resolve)),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("SMTP response timeout")), 15_000)),
    ]);
    if (this.failure) throw this.failure;
    if (!expected.includes(response.code)) throw new Error(`SMTP rejected command (${response.code})`);
    return response;
  }

  async command(command: string, expected: number[]) {
    this.socket.write(`${command}\r\n`);
    return this.read(expected);
  }

  sendData(data: string) { this.socket.write(data); }

  close() { this.socket.end(); }
}

async function openSmtp(host: string, port: number) {
  const socket = connectTls({ host, port, servername: host });
  const smtp = new SmtpConnection(socket);
  await Promise.race([
    new Promise<void>((resolve, reject) => { socket.once("secureConnect", resolve); socket.once("error", reject); }),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("SMTP connection timeout")), 15_000)),
  ]);
  return smtp;
}

async function sendContactEmail(env: Env, details: { name: string; company: string; email: string; phone: string; industry: string; message: string; locale: string }) {
  const host = env.SMTP_HOST;
  const username = env.SMTP_USERNAME;
  const password = env.SMTP_PASSWORD;
  const from = env.SMTP_FROM ?? username;
  const to = env.CONTACT_TO ?? "hello@timzy.app";
  const port = Number(env.SMTP_PORT ?? "465");
  if (!host || !username || !password || !from || !Number.isInteger(port)) throw new Error("Contact mail is not configured");

  const subject = `Nowe zapytanie Timzy: ${details.company}`;
  const body = [
    "Nowe zapytanie z formularza na stronie Timzy", "", `Imię i nazwisko: ${details.name}`, `Firma / marka: ${details.company}`,
    `E-mail: ${details.email}`, `Telefon: ${details.phone || "nie podano"}`, `Branża: ${details.industry}`, `Język strony: ${details.locale}`,
    "", "Wiadomość:", details.message || "nie podano", "", `Otrzymano: ${new Date().toISOString()}`,
  ].join("\n");
  const message = [
    `From: Timzy Formularz <${safeHeader(from)}>`, `To: ${safeHeader(to)}`, `Reply-To: ${safeHeader(details.email)}`,
    `Subject: ${encodeHeader(subject)}`, `Date: ${new Date().toUTCString()}`, `Message-ID: <${crypto.randomUUID()}@timzy.app>`,
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", wrapBase64(body),
  ].join("\r\n");

  const smtp = await openSmtp(host, port);
  try {
    await smtp.read([220]);
    await smtp.command("EHLO timzy.app", [250]);
    await smtp.command("AUTH LOGIN", [334]);
    await smtp.command(Buffer.from(username, "utf8").toString("base64"), [334]);
    await smtp.command(Buffer.from(password, "utf8").toString("base64"), [235]);
    await smtp.command(`MAIL FROM:<${safeHeader(from)}>`, [250]);
    await smtp.command(`RCPT TO:<${safeHeader(to)}>`, [250, 251]);
    await smtp.command("DATA", [354]);
    smtp.sendData(`${message.replace(/^\./gm, "..")}\r\n.\r\n`);
    await smtp.read([250]);
    await smtp.command("QUIT", [221]);
  } finally {
    smtp.close();
  }
}

async function handleContact(request: Request, env: Env) {
  if (!env.CAPTCHA_SECRET) return json({ ok: false, code: "configuration" }, 503);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false, code: "origin" }, 403);
  let payload: ContactPayload;
  try { payload = await request.json() as ContactPayload; } catch { return json({ ok: false, code: "validation" }, 400); }
  const name = clean(payload.name, 100);
  const company = clean(payload.company, 140);
  const email = clean(payload.email, 180).toLowerCase();
  const phone = clean(payload.phone, 40);
  const industry = clean(payload.industry, 100);
  const message = clean(payload.message, 2500);
  const locale = clean(payload.locale, 8) || "pl";
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;
  if (clean(payload.website, 200)) return json({ ok: true });
  if (!name || !company || !industry || payload.privacyAccepted !== true || !/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, code: "validation" }, 400);
  if (Date.now() - startedAt < 2_000 || Date.now() - startedAt > 2 * 60 * 60_000) return json({ ok: false, code: "captcha" }, 400);
  const captchaToken = clean(payload.captchaToken, 1200);
  const captchaAnswer = clean(payload.captchaAnswer, 10);
  if (!await verifyCaptcha(captchaToken, captchaAnswer, env.CAPTCHA_SECRET)) return json({ ok: false, code: "captcha" }, 400);
  try {
    await sendContactEmail(env, { name, company, email, phone, industry, message, locale });
    return json({ ok: true });
  } catch (error) {
    console.error("Contact delivery failed", error instanceof Error ? error.message : "unknown error");
    return json({ ok: false, code: "delivery" }, 502);
  }
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact-challenge" && request.method === "GET") {
      if (!env.CAPTCHA_SECRET) return json({ error: "Contact form is not configured" }, 503);
      return json(await createCaptcha(env.CAPTCHA_SECRET));
    }

    if (url.pathname === "/api/contact" && request.method === "POST") return handleContact(request, env);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
