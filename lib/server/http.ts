export function jsonResponse(payload: unknown, status = 200, headers: HeadersInit = {}): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("cache-control", "no-store");
  responseHeaders.set("content-type", "application/json; charset=utf-8");
  responseHeaders.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(payload), { status, headers: responseHeaders });
}

export function apiError(status: number, code: string, message: string): Response {
  return jsonResponse({ ok: false, code, message }, status);
}

export async function readJson(request: Request, maxBytes = 64_000): Promise<unknown> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("PAYLOAD_TOO_LARGE");
  return text ? JSON.parse(text) : {};
}

export function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return message.replace(/sk_(?:test|live)_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+/g, "[redacted]").slice(0, 300);
}
