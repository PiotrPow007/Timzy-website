import { encryptBytes, sha256 } from "../commerce/security";
import type { TimzyEnv } from "./env";
import type { OrderRow } from "./orders";

export type OrderAssetView = {
  id: string;
  kind: "BRAND_LOGO";
  fileName: string;
  contentType: string;
  byteLength: number;
  plaintextHash: string;
};

type OrderAssetRow = {
  id: string;
  order_id: string;
  kind: "BRAND_LOGO";
  file_name: string;
  content_type: string;
  r2_key: string;
  encryption_iv: string;
  plaintext_hash: string;
  byte_length: number;
};

function view(row: OrderAssetRow): OrderAssetView {
  return { id: row.id, kind: row.kind, fileName: row.file_name, contentType: row.content_type, byteLength: row.byte_length, plaintextHash: row.plaintext_hash };
}

function hasBytes(bytes: Uint8Array, expected: number[], offset = 0): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

export function validateBrandLogo(bytes: Uint8Array, contentType: string): void {
  if (bytes.byteLength < 20 || bytes.byteLength > 5 * 1024 * 1024) throw new Error("Logo must be between 20 bytes and 5 MB");
  const valid = contentType === "image/png" ? hasBytes(bytes, [137, 80, 78, 71, 13, 10, 26, 10])
    : contentType === "image/jpeg" ? hasBytes(bytes, [0xff, 0xd8, 0xff])
      : contentType === "image/webp" ? hasBytes(bytes, [82, 73, 70, 70]) && hasBytes(bytes, [87, 69, 66, 80], 8)
        : false;
  if (!valid) throw new Error("Only valid PNG, JPEG or WebP logo files are allowed");
}

export async function brandLogoForOrder(db: D1Database, orderId: string): Promise<OrderAssetView | null> {
  const row = await db.prepare("SELECT * FROM order_assets WHERE order_id=? AND kind='BRAND_LOGO'").bind(orderId).first<OrderAssetRow>();
  return row ? view(row) : null;
}

export async function brandLogoSnapshot(db: D1Database, orderId: string): Promise<OrderAssetView[]> {
  const logo = await brandLogoForOrder(db, orderId);
  return logo ? [logo] : [];
}

export async function storeBrandLogo(env: TimzyEnv, order: OrderRow, bytes: Uint8Array, rawFileName: string, contentType: string): Promise<OrderAssetView> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("Asset encryption is not configured");
  if (!["DRAFT", "AWAITING_ACCEPTANCE"].includes(order.status)) throw new Error("Branding materials can no longer be changed for this order");
  validateBrandLogo(bytes, contentType);
  const safeName = rawFileName.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120) || `brand-logo.${contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg"}`;
  const existing = await env.DB.prepare("SELECT * FROM order_assets WHERE order_id=? AND kind='BRAND_LOGO'").bind(order.id).first<OrderAssetRow>();
  const id = existing?.id ?? crypto.randomUUID();
  const plaintextHash = await sha256(bytes);
  const encrypted = await encryptBytes(bytes, env.DATA_ENCRYPTION_KEY);
  const r2Key = `order-assets/${order.id}/${crypto.randomUUID()}.aesgcm`;
  const retention = new Date(); retention.setUTCDate(retention.getUTCDate() + 30);
  await env.DOCUMENTS.put(r2Key, encrypted.ciphertext, { httpMetadata: { contentType: "application/octet-stream" }, customMetadata: { orderId: order.id, kind: "BRAND_LOGO", plaintextHash } });
  try {
    await env.DB.prepare(`INSERT INTO order_assets (id,order_id,kind,file_name,content_type,r2_key,encryption_iv,plaintext_hash,byte_length,retention_until)
      VALUES (?,?,'BRAND_LOGO',?,?,?,?,?,?,?) ON CONFLICT(order_id,kind) DO UPDATE SET file_name=excluded.file_name,content_type=excluded.content_type,
      r2_key=excluded.r2_key,encryption_iv=excluded.encryption_iv,plaintext_hash=excluded.plaintext_hash,byte_length=excluded.byte_length,retention_until=excluded.retention_until,updated_at=CURRENT_TIMESTAMP`)
      .bind(id, order.id, safeName, contentType, r2Key, encrypted.iv, plaintextHash, bytes.byteLength, retention.toISOString()).run();
  } catch (error) {
    await env.DOCUMENTS.delete(r2Key);
    throw error;
  }
  if (existing?.r2_key && existing.r2_key !== r2Key) await env.DOCUMENTS.delete(existing.r2_key);
  const saved = await env.DB.prepare("SELECT * FROM order_assets WHERE order_id=? AND kind='BRAND_LOGO'").bind(order.id).first<OrderAssetRow>();
  if (!saved) throw new Error("The logo could not be saved");
  const changed = !existing || existing.file_name !== saved.file_name || existing.content_type !== saved.content_type || existing.plaintext_hash !== saved.plaintext_hash;
  if (changed) {
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare("UPDATE verification_signers SET accepted_at=NULL,email_verified_at=NULL,document_hash=NULL,status='NEEDS_REINVITATION',updated_at=? WHERE order_id=? AND signer_role='SECONDARY'").bind(now, order.id),
      env.DB.prepare("UPDATE second_signer_invites SET revoked_at=? WHERE signer_id IN (SELECT id FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY') AND used_at IS NULL AND revoked_at IS NULL").bind(now, order.id),
      env.DB.prepare("UPDATE company_verifications SET representative_result='SECOND_SIGNER_REQUIRED',overall_status='SECOND_SIGNER_REQUIRED',reason_code='BRAND_LOGO_CHANGED',updated_at=? WHERE order_id=? AND EXISTS (SELECT 1 FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY')").bind(now, order.id, order.id),
      env.DB.prepare("UPDATE orders SET verification_status='SECOND_SIGNER_REQUIRED',updated_at=? WHERE id=? AND EXISTS (SELECT 1 FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY')").bind(now, order.id, order.id),
    ]);
  }
  return view(saved);
}
