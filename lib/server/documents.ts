import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import type { ClientLegalData, CommerceCatalog, CommerceQuote, Locale } from "../commerce/types";
import { canonicalJson, encryptBytes, sha256 } from "../commerce/security";
import type { TimzyEnv } from "./env";

type DocumentKind = "AGREEMENT" | "TERMS" | "DPA" | "PRIVACY";
type VersionContent = { title?: string; sections?: string[] };
type ContractVersionRow = { id: string; kind: DocumentKind; version: number; content_json: string; content_hash: string };

export type ContractBundle = {
  schemaVersion: 1;
  orderId: string;
  orderNumber: string;
  generatedAt: string;
  language: Locale;
  quoteFingerprint: string;
  seller: CommerceQuote["market"]["seller"];
  technologyProvider: CommerceQuote["market"]["technologyProvider"];
  client: ClientLegalData;
  commercialSummary: {
    market: string; currency: string; contractTerm: string; lines: CommerceQuote["lines"]; monthlyNetMinor: number; oneTimeNetMinor: number;
    activationFeeMinor: number; annualCommitmentNetMinor: number | null; deploymentDays: number;
  };
  documents: Array<{ kind: DocumentKind; versionId: string; version: number; contentHash: string; title: string; sections: string[] }>;
  mandatoryTerms: string[];
};

const rollout: Record<Locale, string> = {
  pl: "Standardowy czas przygotowania i wdrożenia podstawowej wersji Timzy wynosi około 7 dni roboczych od dnia zaksięgowania wymaganej płatności oraz otrzymania od Klienta kompletu prawidłowych danych, materiałów i akceptacji. Termin może ulec zmianie w zależności od wybranego pakietu, zakresu dodatkowych funkcji, integracji, szybkości współpracy z Klientem oraz czasu weryfikacji aplikacji przez operatorów Google Play i Apple App Store. Czas weryfikacji przez Google lub Apple jest niezależny od Sprzedawcy i Dostawcy Technologii.",
  en: "The standard preparation and implementation time for the basic Timzy version is approximately 7 business days after the required payment is credited and the Client has supplied complete and correct data, materials and approvals. Timing can change depending on the selected package, additional functionality, integrations, the speed of cooperation and review by Google Play and Apple App Store. Review time by Google or Apple is outside the Seller's and Technology Provider's control.",
  es: "El plazo estándar de preparación e implementación de la versión básica de Timzy es de aproximadamente 7 días laborables desde la recepción del pago requerido y de todos los datos, materiales y aprobaciones correctos del Cliente. El plazo puede variar según el paquete, las funciones adicionales, las integraciones, la rapidez de colaboración y la revisión de Google Play y Apple App Store. El tiempo de revisión de Google o Apple no depende del Vendedor ni del Proveedor de Tecnología.",
};

function mandatoryTerms(language: Locale, quote: CommerceQuote): string[] {
  const annual = {
    pl: "Umowa ma minimalny okres 12 miesięcy. Abonament jest płatny miesięcznie z góry. Zwolnienie z opłaty aktywacyjnej jest udzielane w zamian za 12-miesięczne zobowiązanie. Po tym okresie umowa przechodzi na czas nieokreślony z 30-dniowym okresem wypowiedzenia.",
    en: "The agreement has a minimum term of 12 months and is billed monthly in advance. The activation-fee waiver is provided in exchange for the 12-month commitment. It then continues indefinitely with 30 days' notice.",
    es: "El contrato tiene una duración mínima de 12 meses y se factura mensualmente por adelantado. La exención de la cuota de activación se concede a cambio de este compromiso. Después continúa por tiempo indefinido con 30 días de preaviso.",
  }[language];
  const open = {
    pl: "Umowa jest zawierana na czas nieokreślony z 30-dniowym okresem wypowiedzenia. Opłata aktywacyjna jest oddzielna od miesięcznego abonamentu. Zmiana ceny wymaga powiadomienia co najmniej 30 dni wcześniej.",
    en: "The agreement is open-ended with 30 days' notice. The activation fee is separate from the monthly subscription. Price changes require at least 30 days' prior notice.",
    es: "El contrato es indefinido con 30 días de preaviso. La cuota de activación es independiente de la suscripción mensual. Los cambios de precio requieren al menos 30 días de aviso previo.",
  }[language];
  const recurring = {
    pl: "Płatności abonamentowe są pobierane miesięcznie, a nie jednorazowo za cały rok. Podatek jest obliczany na podstawie zatwierdzonych danych rozliczeniowych i konfiguracji podatkowej Stripe.",
    en: "Subscription charges are collected monthly, not as a single annual payment. Tax is calculated from the confirmed billing data and the Stripe tax configuration.",
    es: "Las cuotas se cobran mensualmente, no en un único pago anual. Los impuestos se calculan según los datos de facturación confirmados y la configuración fiscal de Stripe.",
  }[language];
  const provider = quote.market.code === "PL" ? {
    pl: "Sprzedawcą i stroną rozliczeniową jest 7Software sp. z o.o. Dostawcą Technologii oraz procesorem danych produkcyjnych w zakresie DPA jest INNOVARE GROUP LTD. Umowa powierzenia jest zawierana bezpośrednio z INNOVARE GROUP LTD.",
    en: "The seller and billing party is 7Software sp. z o.o. INNOVARE GROUP LTD is the Technology Provider and processes production data within the scope of the DPA. The DPA is entered into directly with INNOVARE GROUP LTD.",
    es: "El vendedor y la parte de facturación es 7Software sp. z o.o. INNOVARE GROUP LTD es el Proveedor de Tecnología y el encargado del tratamiento de datos de producción en el ámbito del DPA. El DPA se celebra directamente con INNOVARE GROUP LTD.",
  }[language] : {
    pl: "Sprzedawcą i Dostawcą Technologii jest INNOVARE GROUP LTD. 7Software sp. z o.o. nie jest stroną tej umowy. Umowa oraz wszelkie zobowiązania pozaumowne wynikające z niej lub pozostające z nią w związku podlegają prawu angielskiemu. Sądy Anglii i Walii posiadają wyłączną jurysdykcję do rozstrzygania sporów wynikających z Umowy lub pozostających z nią w związku, z zastrzeżeniem bezwzględnie obowiązujących przepisów prawa.",
    en: "INNOVARE GROUP LTD is both the Seller and Technology Provider. 7Software sp. z o.o. is not a party. The agreement and any non-contractual obligations arising from or connected with it are governed by English law. The courts of England and Wales have exclusive jurisdiction, subject to mandatory applicable law.",
    es: "INNOVARE GROUP LTD es el Vendedor y el Proveedor de Tecnología. 7Software sp. z o.o. no es parte del contrato. El contrato y las obligaciones extracontractuales relacionadas se rigen por el Derecho inglés. Los tribunales de Inglaterra y Gales tendrán jurisdicción exclusiva, sin perjuicio de las normas imperativas aplicables.",
  }[language];
  return [quote.contractTerm === "ANNUAL_12" ? annual : open, recurring, provider, rollout[language]];
}

export async function buildContractBundle(db: D1Database, input: { orderId: string; orderNumber: string; quote: CommerceQuote; catalog: CommerceCatalog; client: ClientLegalData; generatedAt?: string }): Promise<ContractBundle> {
  const versions = input.catalog.documentVersions;
  if (!versions) throw new Error("Published legal documents are unavailable");
  const ids = Object.values(versions).map((version) => version.id);
  const placeholders = ids.map(() => "?").join(",");
  const rows = await db.prepare(`SELECT cv.id, ct.kind, cv.version, cv.content_json, cv.content_hash FROM contract_versions cv JOIN contract_templates ct ON ct.id = cv.template_id WHERE cv.id IN (${placeholders}) AND cv.status = 'ACTIVE'`)
    .bind(...ids).all<ContractVersionRow>();
  if (rows.results.length !== 4) throw new Error("A legal document version changed before acceptance");
  const documents = rows.results.map((row) => {
    const content = JSON.parse(row.content_json) as VersionContent;
    return { kind: row.kind, versionId: row.id, version: row.version, contentHash: row.content_hash, title: content.title ?? row.kind, sections: Array.isArray(content.sections) ? content.sections : [] };
  }).sort((left, right) => left.kind.localeCompare(right.kind));
  return {
    schemaVersion: 1, orderId: input.orderId, orderNumber: input.orderNumber, generatedAt: input.generatedAt ?? new Date().toISOString(), language: input.catalog.language,
    quoteFingerprint: input.quote.fingerprint, seller: input.quote.market.seller, technologyProvider: input.quote.market.technologyProvider, client: input.client,
    commercialSummary: { market: input.quote.market.code, currency: input.quote.currency, contractTerm: input.quote.contractTerm, lines: input.quote.lines,
      monthlyNetMinor: input.quote.monthlyNetMinor, oneTimeNetMinor: input.quote.oneTimeNetMinor, activationFeeMinor: input.quote.activationFeeMinor,
      annualCommitmentNetMinor: input.quote.annualCommitmentNetMinor, deploymentDays: input.quote.deploymentDays },
    documents, mandatoryTerms: mandatoryTerms(input.catalog.language, input.quote),
  };
}

function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }

function documentLabels(language: Locale) {
  return {
    pl: { parties: "Strony", summary: "Podsumowanie handlowe", item: "Pozycja", quantity: "Liczba", net: "Netto", type: "Rodzaj", included: "Zawarte w pakiecie", monthly: "Miesięcznie netto", oneTime: "Jednorazowo netto", seller: "SPRZEDAWCA", client: "KLIENT" },
    en: { parties: "Parties", summary: "Commercial summary", item: "Item", quantity: "Qty", net: "Net", type: "Type", included: "Included in the plan", monthly: "Monthly net", oneTime: "One-time net", seller: "SELLER", client: "CLIENT" },
    es: { parties: "Partes", summary: "Resumen comercial", item: "Concepto", quantity: "Cantidad", net: "Neto", type: "Tipo", included: "Incluido en el plan", monthly: "Mensual neto", oneTime: "Único neto", seller: "VENDEDOR", client: "CLIENTE" },
  }[language];
}

export function contractBundleHash(bundle: ContractBundle): Promise<string> { return sha256(canonicalJson(bundle)); }

export function renderContractHtml(bundle: ContractBundle): string {
  const labels = documentLabels(bundle.language);
  const money = (minor: number) => new Intl.NumberFormat(bundle.language, { style: "currency", currency: bundle.commercialSummary.currency }).format(minor / 100);
  const items = bundle.commercialSummary.lines.map((line) => `<tr><td>${escapeHtml(line.name)}</td><td>${line.quantity}</td><td>${line.included ? labels.included : money(line.totalAmountMinor)}</td><td>${line.paymentType}</td></tr>`).join("");
  const docs = bundle.documents.map((document) => `<section><h2>${escapeHtml(document.title)} · v${document.version}</h2>${document.sections.map((section) => `<p>${escapeHtml(section)}</p>`).join("")}</section>`).join("");
  return `<!doctype html><html lang="${bundle.language}"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(bundle.orderNumber)}</title><style>body{font:15px/1.6 Arial,sans-serif;color:#20192b;max-width:850px;margin:40px auto;padding:0 24px}h1,h2{line-height:1.2}table{width:100%;border-collapse:collapse}td,th{padding:8px;border:1px solid #ddd;text-align:left}.meta{color:#665d70}</style></head><body><h1>Timzy · ${escapeHtml(bundle.orderNumber)}</h1><p class="meta">${escapeHtml(bundle.generatedAt)} · ${escapeHtml(bundle.commercialSummary.market)} · ${escapeHtml(bundle.commercialSummary.currency)}</p><h2>${labels.parties}</h2><p><b>${escapeHtml(bundle.seller.legalName)}</b>, ${escapeHtml([bundle.seller.addressLine1,bundle.seller.postalCode,bundle.seller.city].filter(Boolean).join(", "))}</p><p><b>${escapeHtml(bundle.client.legalName)}</b>, ${escapeHtml(`${bundle.client.registeredAddress}, ${bundle.client.postalCode} ${bundle.client.city}`)}</p><h2>${labels.summary}</h2><table><thead><tr><th>${labels.item}</th><th>${labels.quantity}</th><th>${labels.net}</th><th>${labels.type}</th></tr></thead><tbody>${items}</tbody></table><p>${labels.monthly}: <b>${money(bundle.commercialSummary.monthlyNetMinor)}</b><br>${labels.oneTime}: <b>${money(bundle.commercialSummary.oneTimeNetMinor)}</b></p>${bundle.mandatoryTerms.map((term) => `<p>${escapeHtml(term)}</p>`).join("")}${docs}</body></html>`;
}

function plainText(bundle: ContractBundle): string[] {
  const labels = documentLabels(bundle.language);
  const money = (minor: number) => `${(minor / 100).toFixed(2)} ${bundle.commercialSummary.currency}`;
  return [
    `TIMZY · ${bundle.orderNumber}`, `${bundle.generatedAt} · ${bundle.commercialSummary.market} · ${bundle.commercialSummary.currency}`, "",
    `${labels.seller}: ${bundle.seller.legalName}`, [bundle.seller.addressLine1, bundle.seller.postalCode, bundle.seller.city].filter(Boolean).join(", "),
    `${labels.client}: ${bundle.client.legalName}`, `${bundle.client.registeredAddress}, ${bundle.client.postalCode} ${bundle.client.city}`, "", labels.summary.toUpperCase(),
    ...bundle.commercialSummary.lines.map((line) => `${line.name} · ${line.quantity} · ${line.included ? labels.included : money(line.totalAmountMinor)} · ${line.paymentType}`),
    `${labels.monthly}: ${money(bundle.commercialSummary.monthlyNetMinor)}`, `${labels.oneTime}: ${money(bundle.commercialSummary.oneTimeNetMinor)}`, "",
    ...bundle.mandatoryTerms.flatMap((term) => [term, ""]),
    ...bundle.documents.flatMap((document) => [`${document.title} · v${document.version}`, ...document.sections, ""]),
  ];
}

function wrapText(text: string, max = 92): string[] {
  const words = text.split(/\s+/); const lines: string[] = []; let line = "";
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (next.length > max && line) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines.length ? lines : [""];
}

export async function generateContractPdf(bundle: ContractBundle, assets: Fetcher): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const fontResponse = await assets.fetch(new Request("https://assets.local/assets/fonts/manrope-latin-ext.woff2"));
  if (!fontResponse.ok) throw new Error("PDF font asset is unavailable");
  const font = await document.embedFont(await fontResponse.arrayBuffer(), { subset: true });
  let page = document.addPage([595.28, 841.89]); let y = 795;
  for (const paragraph of plainText(bundle)) {
    const lines = wrapText(paragraph);
    for (const line of lines) {
      if (y < 55) { page = document.addPage([595.28, 841.89]); y = 795; }
      page.drawText(line, { x: 48, y, size: 9.5, font, color: rgb(0.12, 0.09, 0.16) }); y -= 14;
    }
    y -= 4;
  }
  document.setTitle(`Timzy ${bundle.orderNumber}`); document.setSubject("Accepted Timzy contract documents"); document.setProducer("Timzy contract service");
  document.setCreationDate(new Date(bundle.generatedAt)); document.setModificationDate(new Date(bundle.generatedAt));
  return document.save({ useObjectStreams: true });
}

export async function archiveFinalPdf(env: TimzyEnv, db: D1Database, bundle: ContractBundle, pdf: Uint8Array): Promise<{ id: string; hash: string }> {
  if (!env.DATA_ENCRYPTION_KEY) throw new Error("Document encryption is not configured");
  const hash = await sha256(pdf); const encrypted = await encryptBytes(pdf, env.DATA_ENCRYPTION_KEY); const id = crypto.randomUUID();
  const r2Key = `contracts/${bundle.orderId}/${id}.pdf.aesgcm`;
  await env.DOCUMENTS.put(r2Key, encrypted.ciphertext, { httpMetadata: { contentType: "application/octet-stream" }, customMetadata: { orderId: bundle.orderId, plaintextHash: hash } });
  const retention = new Date(bundle.generatedAt); retention.setUTCFullYear(retention.getUTCFullYear() + 7);
  await db.prepare(`INSERT INTO contract_documents (id, order_id, kind, r2_key, content_type, encryption_iv, plaintext_hash, byte_length, immutable, retention_until)
    VALUES (?, ?, 'BUNDLE', ?, 'application/pdf', ?, ?, ?, 1, ?)`).bind(id, bundle.orderId, r2Key, encrypted.iv, hash, pdf.byteLength, retention.toISOString()).run();
  return { id, hash };
}
