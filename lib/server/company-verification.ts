import { canonicalJson, decryptJson, encryptBytes, encryptJson, hmacSha256, ipEvidence, randomToken, sha256, timingSafeEqual } from "../commerce/security";
import type { ClientLegalData, CompanyEntityType, CompanyVerificationView, MarketCode, VerificationStatus } from "../commerce/types";
import type { TimzyEnv } from "./env";
import type { SendSystemEmail } from "./notifications";
import type { DraftContext, OrderRow } from "./orders";

type RegistrySnapshot = {
  legalName: string;
  registrationNumber: string;
  taxNumber: string;
  regon: string;
  country: string;
  registeredAddress: string;
  postalCode: string;
  city: string;
  entityType: string;
  status: string;
  representationMethod: string;
  representatives: string[];
  representativeNamesComplete: boolean;
  jointRepresentation: boolean;
  riskFlags: string[];
  verificationSource: string;
  verifiedAt: string;
};

type VerificationRow = {
  id: string; order_id: string; market_code: MarketCode; adapter: string; entity_type: CompanyEntityType; registry_country: string; registry_name: string | null;
  registration_number: string | null; tax_number: string | null; regon: string | null; legal_name: string | null; registered_address: string | null; postal_code: string | null; city: string | null;
  entity_type_name: string | null; registry_status: string | null; representation_method: string | null; company_result: string; representative_result: string; email_result: string;
  overall_status: VerificationStatus; reason_code: string | null; reason_detail: string | null; verification_source: string | null; source_retrieved_at: string | null;
  mapped_snapshot_json: string | null; raw_snapshot_hash: string | null; client_confirmed_at: string | null; verified_at: string | null;
};

type VerifyInput = {
  entityType: CompanyEntityType;
  country: string;
  registrationNumber?: string;
  taxNumber?: string;
  registryName?: string;
  legalName?: string;
  registeredAddress?: string;
  postalCode?: string;
  city?: string;
  entityTypeName?: string;
};

type ConfirmInput = {
  confirmed: boolean;
  representativeName: string;
  representativePosition: string;
  representativeAuthorityBasis: string;
  businessEmail: string;
};

class RegistryUnavailableError extends Error {}
class RegistryNotFoundError extends Error {}

function clean(value: unknown, max = 240): string { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function normalizedPersonName(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean).sort().join(" ");
}
function unmasked(value: string): boolean { return Boolean(value) && !value.includes("*"); }
function address(parts: unknown[]): string { return parts.map((part) => clean(part, 100)).filter(Boolean).join(" "); }

export function normalizeKrs(value: unknown): string {
  const krs = clean(value, 20);
  if (!/^\d{10}$/.test(krs)) throw new Error("KRS must contain exactly 10 digits");
  return krs;
}

export function normalizeNip(value: unknown): string {
  const nip = clean(value, 20).replace(/[ -]/g, "");
  if (!/^\d{10}$/.test(nip)) throw new Error("NIP must contain exactly 10 digits");
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const checksum = weights.reduce((sum, weight, index) => sum + weight * Number(nip[index]), 0) % 11;
  if (checksum === 10 || checksum !== Number(nip[9])) throw new Error("NIP checksum is invalid");
  return nip;
}

export function mapKrsResponse(raw: unknown, now = new Date().toISOString()): RegistrySnapshot {
  const odpis = object(object(raw).odpis); const header = object(odpis.naglowekA); const data = object(odpis.dane); const division1 = object(data.dzial1);
  const entity = object(division1.danePodmiotu); const identifiers = object(entity.identyfikatory); const seat = object(division1.siedzibaIAdres); const registryAddress = object(seat.adres);
  const division2 = object(data.dzial2); const representation = object(division2.reprezentacja); const members = array(representation.sklad);
  const representatives = members.map((member) => {
    const row = object(member); const names = object(row.imiona); const surname = object(row.nazwisko);
    return [clean(names.imie), clean(names.imieDrugie), clean(surname.nazwiskoICzlon)].filter(Boolean).join(" ");
  }).filter(Boolean);
  const representationMethod = clean(representation.sposobReprezentacji, 2000);
  const division6 = object(data.dzial6); const riskFlags: string[] = [];
  if (division6.likwidacja) riskFlags.push("IN_LIQUIDATION");
  if (division6.postepowanieUpadlosciowe || division6.postepowanieRestrukturyzacyjne) riskFlags.push("INSOLVENCY_OR_RESTRUCTURING");
  const positionState = Number(header.stanPozycji);
  if (Number.isFinite(positionState) && positionState !== 1) riskFlags.push("REGISTRY_POSITION_INACTIVE");
  const registrationNumber = normalizeKrs(header.numerKRS);
  const street = address([registryAddress.ulica, registryAddress.nrDomu && `${registryAddress.nrDomu}`, registryAddress.nrLokalu && `/${registryAddress.nrLokalu}`]);
  return {
    legalName: clean(entity.nazwa, 300), registrationNumber, taxNumber: clean(identifiers.nip, 20), regon: clean(identifiers.regon, 20), country: "PL",
    registeredAddress: street, postalCode: clean(registryAddress.kodPocztowy, 24), city: clean(registryAddress.miejscowosc, 120),
    entityType: clean(entity.formaPrawna, 180), status: riskFlags.length ? riskFlags.join(",") : "ACTIVE", representationMethod,
    representatives, representativeNamesComplete: representatives.length > 0 && representatives.every(unmasked),
    jointRepresentation: /ŁĄCZN|LACZN/i.test(representationMethod) && members.length > 1, riskFlags,
    verificationSource: "KRS_OPEN_API", verifiedAt: now,
  };
}

export function mapCeidgResponse(raw: unknown, expectedNip: string, now = new Date().toISOString()): RegistrySnapshot {
  const root = object(raw); const firms = array(root.firmy ?? root.items ?? root.results); const firm = object(firms[0]);
  if (!Object.keys(firm).length) throw new RegistryNotFoundError("CEIDG entry was not found");
  const owner = object(firm.wlasciciel ?? firm.przedsiebiorca); const businessAddress = object(firm.adresDzialalnosci ?? firm.adresDoDoreczen ?? firm.adres);
  const ownerName = address([owner.imie ?? firm.imie, owner.nazwisko ?? firm.nazwisko]);
  const status = clean(firm.status ?? firm.statusDzialalnosci, 100).toUpperCase(); const riskFlags: string[] = [];
  if (status && !/(AKTYWN|ACTIVE)/.test(status)) riskFlags.push(status.includes("ZAWIES") ? "SUSPENDED" : status.includes("WYKRE") || status.includes("ZAKO") ? "TERMINATED" : "NON_ACTIVE_STATUS");
  return {
    legalName: clean(firm.nazwa ?? firm.nazwaFirmy, 300), registrationNumber: clean(firm.id ?? firm.identyfikatorWpisu, 100), taxNumber: clean(firm.nip, 20) || expectedNip, regon: clean(firm.regon, 20), country: "PL",
    registeredAddress: address([businessAddress.ulica, businessAddress.budynek, businessAddress.lokal && `/${businessAddress.lokal}`]),
    postalCode: clean(businessAddress.kod, 24), city: clean(businessAddress.miasto, 120), entityType: "JEDNOOSOBOWA DZIAŁALNOŚĆ GOSPODARCZA", status: status || "UNKNOWN",
    representationMethod: "Właściciel przedsiębiorstwa działa samodzielnie", representatives: ownerName ? [ownerName] : [], representativeNamesComplete: Boolean(ownerName), jointRepresentation: false,
    riskFlags, verificationSource: "CEIDG_API_V3", verifiedAt: now,
  };
}

export function mapCompaniesHouseResponse(profileRaw: unknown, officersRaw: unknown, now = new Date().toISOString()): RegistrySnapshot {
  const profile = object(profileRaw); const office = object(profile.registered_office_address); const officers = array(object(officersRaw).items)
    .map(object).filter((officer) => !officer.resigned_on && clean(officer.officer_role, 80).includes("director"));
  const status = clean(profile.company_status, 100).toUpperCase(); const riskFlags: string[] = [];
  if (status !== "ACTIVE") riskFlags.push(status === "LIQUIDATION" ? "IN_LIQUIDATION" : "NON_ACTIVE_STATUS");
  return {
    legalName: clean(profile.company_name, 300), registrationNumber: clean(profile.company_number, 40), taxNumber: "", regon: "", country: "GB",
    registeredAddress: address([office.premises, office.address_line_1, office.address_line_2]), postalCode: clean(office.postal_code, 24), city: clean(office.locality, 120),
    entityType: clean(profile.type, 120), status, representationMethod: "Active director", representatives: officers.map((officer) => clean(officer.name, 180)).filter(Boolean),
    representativeNamesComplete: officers.length > 0, jointRepresentation: false, riskFlags, verificationSource: "COMPANIES_HOUSE_API", verifiedAt: now,
  };
}

async function fetchJson(url: string, init: RequestInit = {}, fetcher: typeof fetch = fetch): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetcher(url, { ...init, signal: controller.signal, headers: { accept: "application/json", ...(init.headers ?? {}) } });
      if (response.status === 404) throw new RegistryNotFoundError("Registry entry was not found");
      if (response.status === 429 || response.status >= 500) throw new RegistryUnavailableError(`Registry unavailable (${response.status})`);
      if (!response.ok) throw new Error(`Registry rejected request (${response.status})`);
      return await response.json();
    } catch (error) {
      if (error instanceof RegistryNotFoundError || (error instanceof Error && /rejected/.test(error.message))) throw error;
      lastError = error;
      if (attempt === 1) throw new RegistryUnavailableError(error instanceof Error && error.name === "AbortError" ? "Registry request timed out" : "Registry is temporarily unavailable");
    } finally { clearTimeout(timeout); }
  }
  throw lastError;
}

async function fetchKrs(krs: string, fetcher: typeof fetch): Promise<{ snapshot: RegistrySnapshot; raw: unknown }> {
  for (const registry of ["P", "S"] as const) {
    try {
      const raw = await fetchJson(`https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/${krs}?rejestr=${registry}&format=json`, {}, fetcher);
      return { snapshot: mapKrsResponse(raw), raw };
    } catch (error) { if (!(error instanceof RegistryNotFoundError) || registry === "S") throw error; }
  }
  throw new RegistryNotFoundError("KRS entry was not found in supported registers");
}

async function fetchCeidg(env: TimzyEnv, nip: string, fetcher: typeof fetch): Promise<{ snapshot: RegistrySnapshot; raw: unknown }> {
  if (!env.CEIDG_API_TOKEN) throw new RegistryUnavailableError("CEIDG API token is not configured");
  const base = (env.CEIDG_API_BASE_URL ?? "https://dane.biznes.gov.pl/api/ceidg/v3").replace(/\/$/, "");
  const raw = await fetchJson(`${base}/firmy?nip=${encodeURIComponent(nip)}`, { headers: { authorization: `Bearer ${env.CEIDG_API_TOKEN}` } }, fetcher);
  return { snapshot: mapCeidgResponse(raw, nip), raw };
}

async function fetchCompaniesHouse(env: TimzyEnv, number: string, fetcher: typeof fetch): Promise<{ snapshot: RegistrySnapshot; raw: unknown }> {
  if (!env.COMPANIES_HOUSE_API_KEY) throw new RegistryUnavailableError("Companies House API key is not configured");
  const base = (env.COMPANIES_HOUSE_API_BASE_URL ?? "https://api.company-information.service.gov.uk").replace(/\/$/, "");
  const authorization = `Basic ${btoa(`${env.COMPANIES_HOUSE_API_KEY}:`)}`;
  const [profile, officers] = await Promise.all([
    fetchJson(`${base}/company/${encodeURIComponent(number)}`, { headers: { authorization } }, fetcher),
    fetchJson(`${base}/company/${encodeURIComponent(number)}/officers?items_per_page=100`, { headers: { authorization } }, fetcher),
  ]);
  return { snapshot: mapCompaniesHouseResponse(profile, officers), raw: { profile, officers } };
}

function adapterFor(input: VerifyInput, market: MarketCode): string {
  if (market === "PL" && input.country === "PL" && input.entityType === "PL_KRS") return "KRS";
  if (market === "PL" && input.country === "PL" && input.entityType === "PL_CEIDG") return "CEIDG";
  if (market === "INTERNATIONAL" && input.country === "GB") return "COMPANIES_HOUSE";
  return "MANUAL";
}

function view(row: VerificationRow): CompanyVerificationView {
  return {
    id: row.id, status: row.overall_status, companyResult: row.company_result, representativeResult: row.representative_result, emailResult: row.email_result,
    reasonCode: row.reason_code, reasonDetail: row.reason_detail, adapter: row.adapter, entityType: row.entity_type, legalName: row.legal_name,
    registrationNumber: row.registration_number, taxNumber: row.tax_number, regon: row.regon, registryName: row.registry_name, registryCountry: row.registry_country,
    registeredAddress: row.registered_address, postalCode: row.postal_code, city: row.city, entityTypeName: row.entity_type_name, registryStatus: [row.registry_status, row.regon ? `REGON ${row.regon}` : null].filter(Boolean).join(" · ") || null,
    representationMethod: row.representation_method, verificationSource: row.verification_source, verifiedAt: row.verified_at,
    clientConfirmed: Boolean(row.client_confirmed_at), emailVerified: row.email_result === "VERIFIED",
  };
}

export async function verificationForOrder(db: D1Database, orderId: string): Promise<CompanyVerificationView | null> {
  const row = await db.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(orderId).first<VerificationRow>();
  return row ? view(row) : null;
}

async function setStatus(env: TimzyEnv, verificationId: string, from: VerificationStatus | null, to: VerificationStatus, reasonCode: string | null, reasonDetail: string | null, actorType = "PUBLIC_SESSION", actorId: string | null = null) {
  await env.DB.batch([
    env.DB.prepare("UPDATE company_verifications SET overall_status=?,reason_code=?,reason_detail=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(to, reasonCode, reasonDetail, verificationId),
    env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,reason_detail,actor_type,actor_id) VALUES (?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), verificationId, from, to, reasonCode, reasonDetail, actorType, actorId),
  ]);
}

async function upsertFetching(env: TimzyEnv, order: OrderRow, input: VerifyInput, adapter: string): Promise<VerificationRow> {
  const existing = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(order.id).first<VerificationRow>(); const id = existing?.id ?? crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO company_verifications (id,order_id,market_code,adapter,entity_type,registry_country,registry_name,registration_number,tax_number,overall_status)
    VALUES (?,?,?,?,?,?,?,?,?,'FETCHING') ON CONFLICT(order_id) DO UPDATE SET market_code=excluded.market_code,adapter=excluded.adapter,entity_type=excluded.entity_type,
    registry_country=excluded.registry_country,registry_name=excluded.registry_name,registration_number=excluded.registration_number,tax_number=excluded.tax_number,
    company_result='NOT_STARTED',representative_result='NOT_STARTED',email_result='NOT_STARTED',overall_status='FETCHING',reason_code=NULL,reason_detail=NULL,
    client_confirmed_at=NULL,verified_at=NULL,manual_reviewed_by_admin_id=NULL,manual_review_reason=NULL,updated_at=CURRENT_TIMESTAMP`)
    .bind(id, order.id, order.market_code, adapter, input.entityType, input.country, input.registryName || null, input.registrationNumber || null, input.taxNumber || null).run();
  await env.DB.prepare("UPDATE orders SET verification_status='FETCHING',company_verification_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id, order.id).run();
  await env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,actor_type) VALUES (?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), id, existing?.overall_status ?? null, "FETCHING", "REGISTRY_LOOKUP_STARTED", "PUBLIC_SESSION").run();
  const row = await env.DB.prepare("SELECT * FROM company_verifications WHERE id=?").bind(id).first<VerificationRow>(); if (!row) throw new Error("Verification record was not created"); return row;
}

async function cachedRegistry(env: TimzyEnv, cacheKey: string): Promise<{ snapshot: RegistrySnapshot; rawEncrypted: string; rawHash: string } | null> {
  const row = await env.DB.prepare("SELECT * FROM registry_verification_cache WHERE cache_key=? AND expires_at>?").bind(cacheKey, new Date().toISOString())
    .first<{ mapped_snapshot_json: string; raw_snapshot_encrypted: string; raw_snapshot_hash: string }>();
  return row ? { snapshot: JSON.parse(row.mapped_snapshot_json) as RegistrySnapshot, rawEncrypted: row.raw_snapshot_encrypted, rawHash: row.raw_snapshot_hash } : null;
}

export async function verifyCompany(env: TimzyEnv, context: DraftContext, rawInput: unknown, fetcher: typeof fetch = fetch): Promise<CompanyVerificationView> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  const raw = object(rawInput); const input: VerifyInput = { entityType: clean(raw.entityType, 20) as CompanyEntityType, country: clean(raw.country, 2).toUpperCase(), registrationNumber: clean(raw.registrationNumber, 100), taxNumber: clean(raw.taxNumber, 40), registryName: clean(raw.registryName, 120),
    legalName: clean(raw.legalName, 300), registeredAddress: clean(raw.registeredAddress, 300), postalCode: clean(raw.postalCode, 24), city: clean(raw.city, 120), entityTypeName: clean(raw.entityTypeName, 180) };
  if (!["PL_KRS", "PL_CEIDG", "OTHER_PL", "FOREIGN"].includes(input.entityType) || !/^[A-Z]{2}$/.test(input.country)) throw new Error("Invalid company verification scope");
  const selection = JSON.parse(context.order.selection_json) as { market?: MarketCode };
  const market = context.order.market_code ?? selection.market; if (!market) throw new Error("Select the billing market before company verification");
  if ((market === "PL") !== (input.country === "PL")) throw new Error("Company country does not match the selected Poland/international market");
  if (input.entityType === "PL_KRS") input.registrationNumber = normalizeKrs(input.registrationNumber);
  if (input.entityType === "PL_CEIDG") input.taxNumber = normalizeNip(input.taxNumber);
  if (input.entityType === "FOREIGN" && (!input.registrationNumber || !input.registryName)) throw new Error("Foreign registry name and registration number are required");
  const adapter = adapterFor(input, market); const current = await upsertFetching(env, { ...context.order, market_code: market }, input, adapter);
  if (adapter === "MANUAL") {
    if (!input.legalName || !input.registeredAddress || !input.city) throw new Error("Company name and registered address are required for manual verification");
    const snapshot: RegistrySnapshot = { legalName: input.legalName, registrationNumber: input.registrationNumber ?? "", taxNumber: input.taxNumber ?? "", regon: "", country: input.country,
      registeredAddress: input.registeredAddress, postalCode: input.postalCode ?? "", city: input.city, entityType: input.entityTypeName ?? "", status: "MANUAL_REVIEW_REQUIRED",
      representationMethod: "", representatives: [], representativeNamesComplete: false, jointRepresentation: false, riskFlags: ["NO_TRUSTED_AUTOMATIC_ADAPTER"], verificationSource: `CLIENT_DECLARATION:${input.registryName ?? "UNSPECIFIED"}`, verifiedAt: new Date().toISOString() };
    await env.DB.prepare("UPDATE company_verifications SET legal_name=?,regon=?,registered_address=?,postal_code=?,city=?,entity_type_name=?,registry_status=?,company_result='MANUAL_REVIEW_REQUIRED',representative_result='MANUAL_REVIEW_REQUIRED',overall_status='MANUAL_REVIEW_REQUIRED',reason_code='NO_TRUSTED_AUTOMATIC_ADAPTER',reason_detail=?,verification_source=?,source_retrieved_at=?,mapped_snapshot_json=?,raw_snapshot_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(snapshot.legalName, snapshot.regon, snapshot.registeredAddress, snapshot.postalCode, snapshot.city, snapshot.entityType, snapshot.status, `No configured official registry adapter for ${input.country}`, snapshot.verificationSource, snapshot.verifiedAt,
        canonicalJson(snapshot), await sha256(canonicalJson(snapshot)), current.id).run();
    await env.DB.prepare("UPDATE orders SET verification_status='MANUAL_REVIEW_REQUIRED' WHERE id=?").bind(context.order.id).run();
    await env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,reason_detail,actor_type) VALUES (?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), current.id, "FETCHING", "MANUAL_REVIEW_REQUIRED", "NO_TRUSTED_AUTOMATIC_ADAPTER", `Country ${input.country}`, "SYSTEM").run();
    return (await verificationForOrder(env.DB, context.order.id))!;
  }
  const identifier = adapter === "CEIDG" ? input.taxNumber! : input.registrationNumber!; const cacheKey = `${adapter}:${identifier}`;
  try {
    const cached = await cachedRegistry(env, cacheKey); let snapshot: RegistrySnapshot; let rawEncrypted: string; let rawHash: string;
    if (cached) ({ snapshot, rawEncrypted, rawHash } = cached);
    else {
      const fetched = adapter === "KRS" ? await fetchKrs(identifier, fetcher) : adapter === "CEIDG" ? await fetchCeidg(env, identifier, fetcher) : await fetchCompaniesHouse(env, identifier, fetcher);
      snapshot = fetched.snapshot; const rawJson = canonicalJson(fetched.raw); rawHash = await sha256(rawJson); rawEncrypted = await encryptJson(fetched.raw, env.DATA_ENCRYPTION_KEY);
      await env.DB.prepare(`INSERT INTO registry_verification_cache (cache_key,adapter,mapped_snapshot_json,raw_snapshot_encrypted,raw_snapshot_hash,verification_source,source_retrieved_at,expires_at)
        VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(cache_key) DO UPDATE SET mapped_snapshot_json=excluded.mapped_snapshot_json,raw_snapshot_encrypted=excluded.raw_snapshot_encrypted,
        raw_snapshot_hash=excluded.raw_snapshot_hash,verification_source=excluded.verification_source,source_retrieved_at=excluded.source_retrieved_at,expires_at=excluded.expires_at,created_at=CURRENT_TIMESTAMP`)
        .bind(cacheKey, adapter, canonicalJson(snapshot), rawEncrypted, rawHash, snapshot.verificationSource, snapshot.verifiedAt, new Date(Date.now() + 24 * 60 * 60_000).toISOString()).run();
    }
    const status: VerificationStatus = snapshot.riskFlags.length ? "MANUAL_REVIEW_REQUIRED" : "COMPANY_VERIFIED";
    await env.DB.prepare(`UPDATE company_verifications SET registration_number=?,tax_number=?,legal_name=?,regon=?,registered_address=?,postal_code=?,city=?,entity_type_name=?,registry_status=?,representation_method=?,
      company_result=?,representative_result='NOT_STARTED',email_result='NOT_STARTED',overall_status=?,reason_code=?,reason_detail=?,verification_source=?,source_retrieved_at=?,
      mapped_snapshot_json=?,raw_snapshot_encrypted=?,raw_snapshot_hash=?,risk_flags_json=?,verified_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(snapshot.registrationNumber, snapshot.taxNumber, snapshot.legalName, snapshot.regon, snapshot.registeredAddress, snapshot.postalCode, snapshot.city, snapshot.entityType, snapshot.status, snapshot.representationMethod,
        snapshot.riskFlags.length ? "MANUAL_REVIEW_REQUIRED" : "VERIFIED", status, snapshot.riskFlags.length ? snapshot.riskFlags[0] : null,
        snapshot.riskFlags.length ? snapshot.riskFlags.join(", ") : null, snapshot.verificationSource, snapshot.verifiedAt, canonicalJson(snapshot), rawEncrypted, rawHash,
        canonicalJson(snapshot.riskFlags), snapshot.verifiedAt, current.id).run();
    await env.DB.prepare("UPDATE orders SET verification_status=? WHERE id=?").bind(status, context.order.id).run();
    await env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,reason_detail,actor_type) VALUES (?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), current.id, "FETCHING", status, snapshot.riskFlags[0] ?? "COMPANY_REGISTRY_VERIFIED", snapshot.riskFlags.join(", ") || null, "SYSTEM").run();
  } catch (error) {
    const notFound = error instanceof RegistryNotFoundError; const status: VerificationStatus = notFound ? "MANUAL_REVIEW_REQUIRED" : "REGISTRY_UNAVAILABLE";
    const reasonCode = notFound ? "REGISTRY_ENTRY_NOT_FOUND" : error instanceof Error && /timed out/i.test(error.message) ? "REGISTRY_TIMEOUT" : "REGISTRY_UNAVAILABLE";
    await env.DB.prepare("UPDATE company_verifications SET company_result=?,representative_result='NOT_STARTED',overall_status=?,reason_code=?,reason_detail=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(status, status, reasonCode, error instanceof Error ? error.message : "Registry unavailable", current.id).run();
    await env.DB.prepare("UPDATE orders SET verification_status=? WHERE id=?").bind(status, context.order.id).run();
    await env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,reason_detail,actor_type) VALUES (?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), current.id, "FETCHING", status, reasonCode, error instanceof Error ? error.message : null, "SYSTEM").run();
  }
  return (await verificationForOrder(env.DB, context.order.id))!;
}

export async function confirmCompany(env: TimzyEnv, context: DraftContext, rawInput: unknown): Promise<CompanyVerificationView> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("DATA_ENCRYPTION_KEY is not configured");
  const inputRaw = object(rawInput); const input: ConfirmInput = { confirmed: inputRaw.confirmed === true, representativeName: clean(inputRaw.representativeName, 140), representativePosition: clean(inputRaw.representativePosition, 120), representativeAuthorityBasis: clean(inputRaw.representativeAuthorityBasis, 240), businessEmail: clean(inputRaw.businessEmail, 180).toLowerCase() };
  if (!input.confirmed || !input.representativeName || !input.representativePosition || !input.representativeAuthorityBasis || !/^\S+@\S+\.\S+$/.test(input.businessEmail)) throw new Error("Company confirmation and representative details are required");
  const row = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(context.order.id).first<VerificationRow>();
  if (!row || !row.mapped_snapshot_json || !["COMPANY_VERIFIED", "MANUAL_REVIEW_REQUIRED"].includes(row.overall_status)) throw new Error("Company registry data must be fetched before confirmation");
  const snapshot = JSON.parse(row.mapped_snapshot_json) as RegistrySnapshot; let representativeResult = "VERIFIED"; let status: VerificationStatus = "EMAIL_VERIFICATION_REQUIRED"; let reasonCode: string | null = null;
  const authority = normalizedPersonName(input.representativeAuthorityBasis);
  if (row.company_result !== "VERIFIED") { representativeResult = "MANUAL_REVIEW_REQUIRED"; status = "MANUAL_REVIEW_REQUIRED"; reasonCode = row.reason_code ?? "COMPANY_MANUAL_REVIEW_REQUIRED"; }
  else if (/PELNOMOC|POWER OF ATTORNEY|APODERAD/.test(authority)) { representativeResult = "POWER_OF_ATTORNEY_REQUIRED"; status = "POWER_OF_ATTORNEY_REQUIRED"; reasonCode = "POWER_OF_ATTORNEY_DOCUMENT_REQUIRED"; }
  else if (snapshot.jointRepresentation) { representativeResult = "SECOND_SIGNER_REQUIRED"; status = "SECOND_SIGNER_REQUIRED"; reasonCode = "JOINT_REPRESENTATION"; }
  else if (!snapshot.representativeNamesComplete) { representativeResult = "REPRESENTATION_CHECK_REQUIRED"; status = "REPRESENTATION_CHECK_REQUIRED"; reasonCode = "REGISTRY_PERSON_DATA_MASKED"; }
  else if (!snapshot.representatives.some((name) => normalizedPersonName(name) === normalizedPersonName(input.representativeName))) { representativeResult = "REPRESENTATION_CHECK_REQUIRED"; status = "REPRESENTATION_CHECK_REQUIRED"; reasonCode = "REPRESENTATIVE_NOT_MATCHED"; }
  else if (row.entity_type !== "PL_CEIDG" && /@(gmail|outlook|hotmail|yahoo|icloud|wp|onet|interia)\.[a-z.]+$/i.test(input.businessEmail)) { representativeResult = "REPRESENTATION_CHECK_REQUIRED"; status = "REPRESENTATION_CHECK_REQUIRED"; reasonCode = "PUBLIC_EMAIL_DOMAIN_REQUIRES_REVIEW"; }
  const now = new Date().toISOString(); const emailHash = await sha256(input.businessEmail); const emailEncrypted = await encryptJson(input.businessEmail, env.DATA_ENCRYPTION_KEY);
  await env.DB.batch([
    env.DB.prepare("UPDATE company_verifications SET representative_result=?,overall_status=?,reason_code=?,reason_detail=NULL,client_confirmed_at=?,updated_at=? WHERE id=?")
      .bind(representativeResult, status, reasonCode, now, now, row.id),
    env.DB.prepare(`INSERT INTO verification_signers (id,order_id,signer_role,name,position,authority_basis,email_encrypted,email_hash,status)
      VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(order_id,signer_role) DO UPDATE SET name=excluded.name,position=excluded.position,authority_basis=excluded.authority_basis,
      email_encrypted=excluded.email_encrypted,email_hash=excluded.email_hash,email_verified_at=NULL,document_hash=NULL,accepted_at=NULL,status=excluded.status,updated_at=CURRENT_TIMESTAMP`)
      .bind(crypto.randomUUID(), context.order.id, "PRIMARY", input.representativeName, input.representativePosition, input.representativeAuthorityBasis, emailEncrypted, emailHash, "PENDING_EMAIL"),
    env.DB.prepare("UPDATE orders SET verification_status=?,updated_at=? WHERE id=?").bind(status, now, context.order.id),
    env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,actor_type) VALUES (?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), row.id, row.overall_status, status, reasonCode ?? "COMPANY_DATA_CONFIRMED", "PUBLIC_SESSION"),
  ]);
  return (await verificationForOrder(env.DB, context.order.id))!;
}

export async function assertClientMatchesVerification(env: TimzyEnv, orderId: string, client: ClientLegalData): Promise<void> {
  const row = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(orderId).first<VerificationRow>();
  if (!row || !row.client_confirmed_at) throw new Error("Company verification and confirmation are required");
  const identifierMatches = client.entityType === "PL_CEIDG" ? client.taxId === row.tax_number : (client.companyNumber ?? "") === (row.registration_number ?? "");
  const officialFieldsMatch = (!row.legal_name || normalizedPersonName(client.legalName) === normalizedPersonName(row.legal_name))
    && (!row.registered_address || normalizedPersonName(client.registeredAddress) === normalizedPersonName(row.registered_address))
    && (!row.postal_code || normalizedPersonName(client.postalCode) === normalizedPersonName(row.postal_code))
    && (!row.city || normalizedPersonName(client.city) === normalizedPersonName(row.city))
    && (!row.tax_number || normalizedPersonName(client.taxId) === normalizedPersonName(row.tax_number));
  if (!identifierMatches || !officialFieldsMatch || client.registrationCountry !== row.registry_country || client.entityType !== row.entity_type) {
    await setStatus(env, row.id, row.overall_status, "MANUAL_REVIEW_REQUIRED", "CLIENT_REGISTRY_DATA_MISMATCH", "Customer-entered company data differs from the registry snapshot");
    await env.DB.prepare("UPDATE orders SET verification_status='MANUAL_REVIEW_REQUIRED' WHERE id=?").bind(orderId).run();
    throw new Error("Company data differs from the verified registry snapshot and requires manual review");
  }
  const signer = await env.DB.prepare("SELECT name,position,authority_basis,email_hash FROM verification_signers WHERE order_id=? AND signer_role='PRIMARY'").bind(orderId)
    .first<{ name: string; position: string; authority_basis: string; email_hash: string }>();
  if (!signer || normalizedPersonName(signer.name) !== normalizedPersonName(client.representativeName) || signer.position !== client.representativePosition || signer.authority_basis !== client.representativeAuthorityBasis || signer.email_hash !== await sha256(client.businessEmail)) {
    await setStatus(env, row.id, row.overall_status, "REPRESENTATION_CHECK_REQUIRED", "REPRESENTATIVE_DATA_CHANGED", "Representative details changed after verification");
    await env.DB.prepare("UPDATE orders SET verification_status='REPRESENTATION_CHECK_REQUIRED' WHERE id=?").bind(orderId).run();
    throw new Error("Representative data changed after verification and must be confirmed again");
  }
}

export function generateEmailOtp(): string {
  const random = crypto.getRandomValues(new Uint32Array(1))[0]; return String(random % 1_000_000).padStart(6, "0");
}

function otpTestMode(env: TimzyEnv): boolean { return env.APP_ENV !== "production" && env.EMAIL_VERIFICATION_TEST_MODE === "true"; }

export async function sendEmailVerificationCode(env: TimzyEnv, order: OrderRow, sendEmail: SendSystemEmail): Promise<{ verification: CompanyVerificationView; debugCode?: string }> {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  if (!env.DATA_ENCRYPTION_KEY || !order.client_data_encrypted) throw new Error("Save company data before email verification");
  const data = await decryptJson<ClientLegalData>(order.client_data_encrypted, env.DATA_ENCRYPTION_KEY); const verification = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(order.id).first<VerificationRow>();
  if (!verification?.client_confirmed_at) throw new Error("Confirm the registry data before email verification");
  const emailHash = await sha256(data.businessEmail); const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const sent = await env.DB.prepare("SELECT COUNT(*) count FROM email_verification_challenges WHERE order_id=? AND email_hash=? AND created_at>=?").bind(order.id, emailHash, since).first<{ count: number }>();
  if ((sent?.count ?? 0) >= 3) throw new Error("EMAIL_VERIFICATION_RATE_LIMITED");
  const id = crypto.randomUUID(); const code = generateEmailOtp(); const codeHash = await hmacSha256(`${id}.${code}`, env.SESSION_SECRET); const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE email_verification_challenges SET invalidated_at=CURRENT_TIMESTAMP WHERE order_id=? AND signer_id IS NULL AND consumed_at IS NULL AND invalidated_at IS NULL").bind(order.id),
    env.DB.prepare("INSERT INTO email_verification_challenges (id,order_id,signer_id,email_hash,code_hash,expires_at,max_attempts) VALUES (?,?,NULL,?,?,?,5)").bind(id, order.id, emailHash, codeHash, expiresAt),
  ]);
  if (!otpTestMode(env)) await sendEmail({ to: data.businessEmail, subject: `Timzy · ${order.order_number} · verification code`, text: `Your one-time Timzy verification code is: ${code}\n\nIt expires in 10 minutes and can be used once.` });
  return { verification: view(verification), ...(otpTestMode(env) ? { debugCode: code } : {}) };
}

export async function verifyEmailCode(env: TimzyEnv, order: OrderRow, rawCode: unknown): Promise<CompanyVerificationView> {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured"); const code = clean(rawCode, 12);
  if (!/^\d{6}$/.test(code)) throw new Error("Invalid verification code");
  const challenge = await env.DB.prepare("SELECT * FROM email_verification_challenges WHERE order_id=? AND signer_id IS NULL AND consumed_at IS NULL AND invalidated_at IS NULL ORDER BY created_at DESC LIMIT 1")
    .bind(order.id).first<{ id: string; code_hash: string; expires_at: string; attempt_count: number; max_attempts: number }>();
  if (!challenge) throw new Error("No active verification code");
  if (challenge.expires_at <= new Date().toISOString()) { await env.DB.prepare("UPDATE email_verification_challenges SET invalidated_at=CURRENT_TIMESTAMP WHERE id=?").bind(challenge.id).run(); throw new Error("Verification code expired"); }
  if (challenge.attempt_count >= challenge.max_attempts) throw new Error("Verification attempts exceeded");
  const expected = await hmacSha256(`${challenge.id}.${code}`, env.SESSION_SECRET); const valid = timingSafeEqual(expected, challenge.code_hash);
  await env.DB.prepare("UPDATE email_verification_challenges SET attempt_count=attempt_count+1,consumed_at=CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE consumed_at END,invalidated_at=CASE WHEN NOT ? AND attempt_count+1>=max_attempts THEN CURRENT_TIMESTAMP ELSE invalidated_at END WHERE id=?")
    .bind(valid ? 1 : 0, valid ? 1 : 0, challenge.id).run();
  if (!valid) throw new Error("Invalid verification code");
  const row = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(order.id).first<VerificationRow>(); if (!row) throw new Error("Company verification is unavailable");
  const status: VerificationStatus = row.representative_result === "VERIFIED" ? "VERIFIED" : row.overall_status;
  await env.DB.batch([
    env.DB.prepare("UPDATE company_verifications SET email_result='VERIFIED',overall_status=?,verified_at=CASE WHEN ?='VERIFIED' THEN CURRENT_TIMESTAMP ELSE verified_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status, status, row.id),
    env.DB.prepare("UPDATE verification_signers SET email_verified_at=CURRENT_TIMESTAMP,status=CASE WHEN status='PENDING_EMAIL' THEN 'EMAIL_VERIFIED' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE order_id=? AND signer_role='PRIMARY'").bind(order.id),
    env.DB.prepare("UPDATE orders SET verification_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status, order.id),
    env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,actor_type) VALUES (?,?,?,?,?,?)").bind(crypto.randomUUID(), row.id, row.overall_status, status, "BUSINESS_EMAIL_VERIFIED", "PUBLIC_SESSION"),
  ]);
  return (await verificationForOrder(env.DB, order.id))!;
}

export async function signingScopeHash(db: D1Database, order: OrderRow): Promise<string> {
  if (!order.quote_fingerprint || !order.client_data_hash || !order.market_code || !order.language || !order.contract_term) throw new Error("Save the complete order before requesting another signer");
  const now = new Date().toISOString();
  const versions = await db.prepare(`SELECT ct.kind,cv.id,cv.version,cv.content_hash FROM contract_templates ct JOIN contract_versions cv ON cv.template_id=ct.id
    WHERE ct.market_code=? AND ct.language=? AND cv.status='ACTIVE' AND cv.effective_from<=?
    AND cv.version=(SELECT MAX(v2.version) FROM contract_versions v2 WHERE v2.template_id=ct.id AND v2.status='ACTIVE' AND v2.effective_from<=?) ORDER BY ct.kind`)
    .bind(order.market_code, order.language, now, now).all<Record<string, unknown>>();
  if (versions.results.length !== 4) throw new Error("Published legal documents are unavailable");
  const verification = await db.prepare("SELECT raw_snapshot_hash FROM company_verifications WHERE order_id=?").bind(order.id).first<{ raw_snapshot_hash: string | null }>();
  if (!verification?.raw_snapshot_hash) throw new Error("Registry snapshot is unavailable");
  return sha256(canonicalJson({ orderId: order.id, quoteFingerprint: order.quote_fingerprint, clientDataHash: order.client_data_hash, registrySnapshotHash: verification.raw_snapshot_hash,
    market: order.market_code, language: order.language, contractTerm: order.contract_term, documents: versions.results }));
}

type SecondSignerPublicView = { orderNumber: string; language: "pl" | "en" | "es"; companyName: string; registrationNumber: string; signerName: string; position: string; authorityBasis: string; contractTerm: string; documentHash: string; expiresAt: string };

async function secondSignerByToken(env: TimzyEnv, rawToken: unknown) {
  const token = clean(rawToken, 200); if (token.length < 40) throw new Error("SECOND_SIGNER_LINK_INVALID");
  const tokenHash = await sha256(token);
  const row = await env.DB.prepare(`SELECT i.id invite_id,i.expires_at,i.used_at,i.revoked_at,s.id signer_id,s.order_id,s.name,s.position,s.authority_basis,s.document_hash,s.status,
    o.order_number,o.language,o.contract_term,o.client_data_encrypted FROM second_signer_invites i JOIN verification_signers s ON s.id=i.signer_id JOIN orders o ON o.id=s.order_id WHERE i.token_hash=?`)
    .bind(tokenHash).first<{ invite_id: string; expires_at: string; used_at: string | null; revoked_at: string | null; signer_id: string; order_id: string; name: string; position: string; authority_basis: string; document_hash: string | null; status: string; order_number: string; language: "pl" | "en" | "es"; contract_term: string; client_data_encrypted: string | null }>();
  if (!row || row.revoked_at || row.used_at || row.expires_at <= new Date().toISOString()) throw new Error("SECOND_SIGNER_LINK_INVALID");
  return row;
}

export async function createSecondSignerInvite(env: TimzyEnv, order: OrderRow, rawInput: unknown, sendEmail: SendSystemEmail, baseUrl: string): Promise<{ verification: CompanyVerificationView; debugCode?: string; debugLink?: string }> {
  if (!env.SESSION_SECRET || !env.DATA_ENCRYPTION_KEY) throw new Error("Second signer security is not configured");
  const raw = object(rawInput); const name = clean(raw.name, 140); const position = clean(raw.position, 120); const authorityBasis = clean(raw.authorityBasis, 240); const email = clean(raw.email, 180).toLowerCase();
  if (!name || !position || !authorityBasis || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Complete second signer details are required");
  const verification = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(order.id).first<VerificationRow>();
  if (!verification || verification.overall_status !== "SECOND_SIGNER_REQUIRED") throw new Error("A second signer is not required for this order");
  const primary = await env.DB.prepare("SELECT email_hash FROM verification_signers WHERE order_id=? AND signer_role='PRIMARY'").bind(order.id).first<{ email_hash: string }>();
  const emailHash = await sha256(email); if (!primary || primary.email_hash === emailHash) throw new Error("The second signer must use a different email address");
  const scopeHash = await signingScopeHash(env.DB, order); const encryptedEmail = await encryptJson(email, env.DATA_ENCRYPTION_KEY);
  const existing = await env.DB.prepare("SELECT id FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY'").bind(order.id).first<{ id: string }>(); const signerId = existing?.id ?? crypto.randomUUID();
  const inviteId = crypto.randomUUID(); const token = randomToken(); const tokenHash = await sha256(token); const code = generateEmailOtp(); const challengeId = crypto.randomUUID();
  const codeHash = await hmacSha256(`${challengeId}.${code}`, env.SESSION_SECRET); const expiresAt = new Date(Date.now() + 48 * 60 * 60_000).toISOString(); const codeExpiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO verification_signers (id,order_id,signer_role,name,position,authority_basis,email_encrypted,email_hash,document_hash,status) VALUES (?,?,?,?,?,?,?,?,?,'INVITED')
      ON CONFLICT(order_id,signer_role) DO UPDATE SET name=excluded.name,position=excluded.position,authority_basis=excluded.authority_basis,email_encrypted=excluded.email_encrypted,email_hash=excluded.email_hash,
      email_verified_at=NULL,document_hash=excluded.document_hash,accepted_at=NULL,ip_evidence=NULL,user_agent=NULL,statements_json=NULL,timezone=NULL,status='INVITED',updated_at=CURRENT_TIMESTAMP`)
      .bind(signerId, order.id, "SECONDARY", name, position, authorityBasis, encryptedEmail, emailHash, scopeHash),
    env.DB.prepare("UPDATE second_signer_invites SET revoked_at=CURRENT_TIMESTAMP WHERE signer_id=? AND used_at IS NULL AND revoked_at IS NULL").bind(signerId),
    env.DB.prepare("UPDATE email_verification_challenges SET invalidated_at=CURRENT_TIMESTAMP WHERE signer_id=? AND consumed_at IS NULL AND invalidated_at IS NULL").bind(signerId),
    env.DB.prepare("INSERT INTO second_signer_invites (id,signer_id,token_hash,expires_at) VALUES (?,?,?,?)").bind(inviteId, signerId, tokenHash, expiresAt),
    env.DB.prepare("INSERT INTO email_verification_challenges (id,order_id,signer_id,email_hash,code_hash,expires_at,max_attempts) VALUES (?,?,?,?,?,?,5)").bind(challengeId, order.id, signerId, emailHash, codeHash, codeExpiresAt),
  ]);
  const link = `${baseUrl.replace(/\/$/, "")}/co-signer/?token=${encodeURIComponent(token)}`;
  if (!otpTestMode(env)) await sendEmail({ to: email, subject: `Timzy · ${order.order_number} · second signer`, text: `You were invited as a required second signer for ${order.order_number}.\n\nOpen this one-time link: ${link}\nVerification code: ${code}\n\nThe code expires in 10 minutes. The link expires in 48 hours.` });
  return { verification: view(verification), ...(otpTestMode(env) ? { debugCode: code, debugLink: link } : {}) };
}

export async function secondSignerSummary(env: TimzyEnv, token: unknown): Promise<SecondSignerPublicView> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("Second signer security is not configured"); const row = await secondSignerByToken(env, token);
  if (!row.client_data_encrypted) throw new Error("Order company data is unavailable"); const client = await decryptJson<ClientLegalData>(row.client_data_encrypted, env.DATA_ENCRYPTION_KEY);
  return { orderNumber: row.order_number, language: row.language, companyName: client.legalName, registrationNumber: client.companyNumber || client.taxId, signerName: row.name,
    position: row.position, authorityBasis: row.authority_basis, contractTerm: row.contract_term, documentHash: row.document_hash ?? "", expiresAt: row.expires_at };
}

export async function secondSignerDocumentContext(env: TimzyEnv, token: unknown): Promise<{ order: OrderRow; client: ClientLegalData }> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("Second signer security is not configured"); const row = await secondSignerByToken(env, token);
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(row.order_id).first<OrderRow>(); if (!order || !row.client_data_encrypted) throw new Error("Order data is unavailable");
  if (await signingScopeHash(env.DB, order) !== row.document_hash) throw new Error("The agreement changed; a new second-signer invitation is required");
  return { order, client: await decryptJson<ClientLegalData>(row.client_data_encrypted, env.DATA_ENCRYPTION_KEY) };
}

export async function acceptSecondSigner(env: TimzyEnv, request: Request, rawInput: unknown): Promise<{ orderNumber: string }> {
  if (!env.SESSION_SECRET) throw new Error("Second signer security is not configured"); const raw = object(rawInput); const row = await secondSignerByToken(env, raw.token); const code = clean(raw.code, 12);
  if (!/^\d{6}$/.test(code)) throw new Error("Invalid verification code");
  const required = [raw.companyData, raw.authority, raw.agreementAndTerms, raw.dataProcessing, raw.recurringPayment]; if (required.some((value) => value !== true) || (row.contract_term === "ANNUAL_12" && raw.annualCommitment !== true)) throw new Error("All required statements must be accepted separately");
  const challenge = await env.DB.prepare("SELECT id,code_hash,expires_at,attempt_count,max_attempts FROM email_verification_challenges WHERE signer_id=? AND consumed_at IS NULL AND invalidated_at IS NULL ORDER BY created_at DESC LIMIT 1")
    .bind(row.signer_id).first<{ id: string; code_hash: string; expires_at: string; attempt_count: number; max_attempts: number }>();
  if (!challenge || challenge.expires_at <= new Date().toISOString()) throw new Error("Verification code expired"); if (challenge.attempt_count >= challenge.max_attempts) throw new Error("Verification attempts exceeded");
  const valid = timingSafeEqual(await hmacSha256(`${challenge.id}.${code}`, env.SESSION_SECRET), challenge.code_hash);
  await env.DB.prepare("UPDATE email_verification_challenges SET attempt_count=attempt_count+1,consumed_at=CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE consumed_at END,invalidated_at=CASE WHEN NOT ? AND attempt_count+1>=max_attempts THEN CURRENT_TIMESTAMP ELSE invalidated_at END WHERE id=?")
    .bind(valid ? 1 : 0, valid ? 1 : 0, challenge.id).run(); if (!valid) throw new Error("Invalid verification code");
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id=?").bind(row.order_id).first<OrderRow>(); if (!order || await signingScopeHash(env.DB, order) !== row.document_hash) throw new Error("The agreement changed; a new second-signer invitation is required");
  const verification = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(row.order_id).first<VerificationRow>(); if (!verification) throw new Error("Company verification is unavailable");
  const status: VerificationStatus = verification.email_result === "VERIFIED" ? "VERIFIED" : "EMAIL_VERIFICATION_REQUIRED"; const now = new Date().toISOString();
  const statements = canonicalJson({ companyData: true, authority: true, agreementAndTerms: true, dataProcessing: true, recurringPayment: true, annualCommitment: row.contract_term === "ANNUAL_12" });
  await env.DB.batch([
    env.DB.prepare("UPDATE verification_signers SET email_verified_at=?,accepted_at=?,ip_evidence=?,user_agent=?,statements_json=?,timezone=?,status='ACCEPTED',updated_at=? WHERE id=?")
      .bind(now, now, await ipEvidence(request, env.SESSION_SECRET), (request.headers.get("user-agent") ?? "unknown").slice(0, 500), statements, clean(raw.timezone, 80) || "UTC", now, row.signer_id),
    env.DB.prepare("UPDATE second_signer_invites SET used_at=? WHERE id=? AND used_at IS NULL").bind(now, row.invite_id),
    env.DB.prepare("UPDATE company_verifications SET representative_result='VERIFIED',overall_status=?,reason_code=NULL,reason_detail=NULL,verified_at=CASE WHEN ?='VERIFIED' THEN ? ELSE verified_at END,updated_at=? WHERE id=?").bind(status, status, now, now, verification.id),
    env.DB.prepare("UPDATE orders SET verification_status=?,updated_at=? WHERE id=?").bind(status, now, row.order_id),
    env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,actor_type,actor_id) VALUES (?,?,?,?,?,'SECOND_SIGNER',?)")
      .bind(crypto.randomUUID(), verification.id, verification.overall_status, status, "SECOND_SIGNER_ACCEPTED", row.signer_id),
  ]);
  return { orderNumber: row.order_number };
}

export async function storePowerOfAttorney(env: TimzyEnv, order: OrderRow, bytes: Uint8Array, rawFileName: string, contentType: string): Promise<{ id: string; status: string }> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("Document encryption is not configured"); if (bytes.byteLength < 20 || bytes.byteLength > 5 * 1024 * 1024) throw new Error("Power of attorney must be between 20 bytes and 5 MB");
  const allowed = ["application/pdf", "image/jpeg", "image/png"]; if (!allowed.includes(contentType)) throw new Error("Only PDF, JPEG or PNG files are allowed");
  const magicOk = contentType === "application/pdf" ? new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-" : contentType === "image/jpeg" ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff : bytes.slice(0, 8).every((value, index) => value === [137,80,78,71,13,10,26,10][index]);
  if (!magicOk) throw new Error("The uploaded file content does not match its declared type");
  const verification = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(order.id).first<VerificationRow>(); if (!verification || verification.overall_status !== "POWER_OF_ATTORNEY_REQUIRED") throw new Error("A power of attorney is not required for this order");
  const id = crypto.randomUUID(); const encrypted = await encryptBytes(bytes, env.DATA_ENCRYPTION_KEY); const plaintextHash = await sha256(bytes); const safeName = rawFileName.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120) || "power-of-attorney";
  const r2Key = `verification/${order.id}/${id}.aesgcm`; await env.DOCUMENTS.put(r2Key, encrypted.ciphertext, { httpMetadata: { contentType: "application/octet-stream" }, customMetadata: { orderId: order.id, plaintextHash } });
  const retention = new Date(Date.now() + 90 * 24 * 60 * 60_000);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO verification_documents (id,order_id,kind,file_name,content_type,r2_key,encryption_iv,plaintext_hash,byte_length,status,retention_until) VALUES (?,?,?,?,?,?,?,?,?,'PENDING_REVIEW',?)")
      .bind(id, order.id, "POWER_OF_ATTORNEY", safeName, contentType, r2Key, encrypted.iv, plaintextHash, bytes.byteLength, retention.toISOString()),
    env.DB.prepare("UPDATE company_verifications SET overall_status='MANUAL_REVIEW_REQUIRED',representative_result='MANUAL_REVIEW_REQUIRED',reason_code='POWER_OF_ATTORNEY_PENDING_REVIEW',reason_detail='Encrypted power of attorney uploaded; administrator review required',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(verification.id),
    env.DB.prepare("UPDATE orders SET verification_status='MANUAL_REVIEW_REQUIRED',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(order.id),
    env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,actor_type) VALUES (?,?,?,'MANUAL_REVIEW_REQUIRED','POWER_OF_ATTORNEY_UPLOADED','PUBLIC_SESSION')").bind(crypto.randomUUID(), verification.id, verification.overall_status),
  ]);
  return { id, status: "PENDING_REVIEW" };
}

export function verificationAllowsPayment(status: string | null | undefined): boolean { return status === "VERIFIED"; }

export async function manualVerificationDecision(env: TimzyEnv, adminId: string, orderId: string, raw: unknown): Promise<CompanyVerificationView> {
  const input = object(raw); const decision = clean(input.decision, 40) as VerificationStatus; const reason = clean(input.reason, 1000);
  if (!["VERIFIED", "REJECTED", "REPRESENTATION_CHECK_REQUIRED", "SECOND_SIGNER_REQUIRED", "POWER_OF_ATTORNEY_REQUIRED", "MANUAL_REVIEW_REQUIRED"].includes(decision) || reason.length < 10) throw new Error("A valid verification decision and detailed reason are required");
  const row = await env.DB.prepare("SELECT * FROM company_verifications WHERE order_id=?").bind(orderId).first<VerificationRow>(); if (!row) throw new Error("Verification record not found");
  if (decision === "VERIFIED" && row.overall_status === "SECOND_SIGNER_REQUIRED") {
    const second = await env.DB.prepare("SELECT status,accepted_at FROM verification_signers WHERE order_id=? AND signer_role='SECONDARY'").bind(orderId).first<{ status: string; accepted_at: string | null }>();
    if (second?.status !== "ACCEPTED" || !second.accepted_at) throw new Error("Joint representation cannot be overridden before the required second signer accepts");
  }
  const finalDecision = decision === "VERIFIED" && row.email_result !== "VERIFIED" ? "EMAIL_VERIFICATION_REQUIRED" : decision;
  await env.DB.batch([
    env.DB.prepare("UPDATE company_verifications SET representative_result=?,overall_status=?,reason_code='ADMIN_DECISION',reason_detail=?,manual_reviewed_by_admin_id=?,manual_review_reason=?,verified_at=CASE WHEN ?='VERIFIED' THEN CURRENT_TIMESTAMP ELSE verified_at END,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(decision === "VERIFIED" ? "VERIFIED" : decision, finalDecision, reason, adminId, reason, finalDecision, row.id),
    env.DB.prepare("UPDATE orders SET verification_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(finalDecision, orderId),
    env.DB.prepare("INSERT INTO verification_status_history (id,verification_id,from_status,to_status,reason_code,reason_detail,actor_type,actor_id) VALUES (?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), row.id, row.overall_status, finalDecision, "ADMIN_DECISION", reason, "ADMIN", adminId),
    env.DB.prepare("UPDATE verification_documents SET status=?,reviewed_by_admin_id=?,review_reason=? WHERE order_id=? AND status='PENDING_REVIEW'")
      .bind(decision === "VERIFIED" ? "APPROVED" : decision === "REJECTED" ? "REJECTED" : "PENDING_REVIEW", adminId, reason, orderId),
  ]);
  return (await verificationForOrder(env.DB, orderId))!;
}
