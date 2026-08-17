import type { ClientLegalData, CompanyEntityType, ContractTerm, Locale, MarketCode, OrderSelection } from "./types";

const localeSet = new Set<Locale>(["pl", "en", "es"]);
const marketSet = new Set<MarketCode>(["PL", "UK", "INTERNATIONAL"]);
const termSet = new Set<ContractTerm>(["ANNUAL_12", "OPEN_ENDED"]);

function text(value: unknown, max: number): string { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function country(value: unknown): string { const result = text(value, 2).toUpperCase(); return /^[A-Z]{2}$/.test(result) ? result : ""; }
function bool(value: unknown): boolean { return value === true; }

export function parseSelection(value: unknown): OrderSelection {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const market = text(input.market, 20) as MarketCode;
  const language = text(input.language, 2) as Locale;
  const contractTerm = text(input.contractTerm, 20) as ContractTerm;
  if (!marketSet.has(market) || !localeSet.has(language) || !termSet.has(contractTerm)) throw new Error("Invalid market, language or contract term");
  const registrationCountry = country(input.registrationCountry);
  const billingCountry = country(input.billingCountry);
  if (!registrationCountry || !billingCountry) throw new Error("Registration and billing countries are required");
  if (registrationCountry !== billingCountry) throw new Error("Company and billing country must be the same");
  const planId = input.planId === null || input.planId === undefined || input.planId === "" ? null : text(input.planId, 80);
  const addons = Array.isArray(input.addons) ? input.addons.slice(0, 50).map((entry) => {
    const addon = entry && typeof entry === "object" ? entry as Record<string, unknown> : {};
    return { addonId: text(addon.addonId, 80), quantity: Number(addon.quantity) };
  }).filter((entry) => entry.addonId) : [];
  return { market, language, contractTerm, registrationCountry, billingCountry, planId, addons };
}

export function parseClientData(value: unknown): ClientLegalData {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const entityType = text(input.entityType, 20) as CompanyEntityType;
  if (!["PL_KRS", "PL_CEIDG", "OTHER_PL", "FOREIGN"].includes(entityType)) throw new Error("Company entity type is required");
  const result: ClientLegalData = {
    legalName: text(input.legalName, 180), legalForm: text(input.legalForm, 100), registrationCountry: country(input.registrationCountry),
    registeredAddress: text(input.registeredAddress, 240), postalCode: text(input.postalCode, 24), city: text(input.city, 120),
    billingAddressDifferent: bool(input.billingAddressDifferent), billingAddress: text(input.billingAddress, 240), billingPostalCode: text(input.billingPostalCode, 24),
    billingCity: text(input.billingCity, 120), billingCountry: country(input.billingCountry), taxId: text(input.taxId, 64), companyNumber: text(input.companyNumber, 64), entityType,
    registryName: text(input.registryName, 120),
    representativeName: text(input.representativeName, 140), representativePosition: text(input.representativePosition, 120),
    representativeAuthorityBasis: text(input.representativeAuthorityBasis, 240),
    businessEmail: text(input.businessEmail, 180).toLowerCase(), phone: text(input.phone, 40), brandName: text(input.brandName, 140),
    domain: text(input.domain, 200), appName: text(input.appName, 140), communicationLanguage: text(input.communicationLanguage, 2) as Locale,
    authorityConfirmed: bool(input.authorityConfirmed), companyDataConfirmed: bool(input.companyDataConfirmed),
  };
  const required = [result.legalName, result.legalForm, result.registrationCountry, result.registeredAddress, result.postalCode, result.city, result.billingCountry,
    result.representativeName, result.representativePosition, result.representativeAuthorityBasis, result.businessEmail, result.phone, result.brandName, result.appName];
  if (required.some((entry) => !entry) || !localeSet.has(result.communicationLanguage) || !/^\S+@\S+\.\S+$/.test(result.businessEmail) || !result.authorityConfirmed || !result.companyDataConfirmed) throw new Error("Required company data is incomplete");
  if (result.registrationCountry !== result.billingCountry) throw new Error("Company and billing country must be the same");
  if (result.registrationCountry === "PL" && result.entityType === "FOREIGN") throw new Error("A Polish company must use a Polish entity type");
  if (result.registrationCountry === "PL" && !result.taxId) throw new Error("Polish tax ID is required");
  if (result.registrationCountry === "PL" && result.entityType === "PL_KRS" && !/^\d{10}$/.test(result.companyNumber ?? "")) throw new Error("KRS must contain exactly 10 digits");
  if (result.registrationCountry === "PL" && result.entityType === "PL_CEIDG" && !/^\d{10}$/.test(result.taxId)) throw new Error("NIP must contain exactly 10 digits");
  if (result.entityType === "OTHER_PL" && (!result.companyNumber || !result.registryName)) throw new Error("Polish registry name and registration number are required");
  if (result.registrationCountry !== "PL" && (result.entityType !== "FOREIGN" || !result.companyNumber || !result.registryName)) throw new Error("Foreign registry name and registration number are required");
  if (result.billingAddressDifferent && (!result.billingAddress || !result.billingPostalCode || !result.billingCity)) throw new Error("Billing address is incomplete");
  return result;
}

export function marketForBillingCountry(billingCountry: string): MarketCode {
  const code = billingCountry.toUpperCase();
  return code === "PL" ? "PL" : code === "GB" ? "UK" : "INTERNATIONAL";
}

export function selectionForMarket(selection: OrderSelection, market: MarketCode, internationalFallback = "GB"): OrderSelection {
  const fallback = country(internationalFallback) || "GB";
  if (market === "PL") return { ...selection, market, registrationCountry: "PL", billingCountry: "PL" };
  if (market === "UK") return { ...selection, market, registrationCountry: "GB", billingCountry: "GB" };
  const registrationCountry = !selection.registrationCountry || ["PL", "GB"].includes(selection.registrationCountry) ? (fallback === "PL" || fallback === "GB" ? "ES" : fallback) : selection.registrationCountry;
  return { ...selection, market, registrationCountry, billingCountry: registrationCountry };
}
