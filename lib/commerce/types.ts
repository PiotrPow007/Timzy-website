export type MarketCode = "PL" | "UK" | "INTERNATIONAL";
export type Locale = "pl" | "en" | "es";
export type Currency = "PLN" | "GBP" | "EUR";
export type ContractTerm = "ANNUAL_12" | "OPEN_ENDED";
export type PaymentType = "MONTHLY" | "ONE_TIME";
export type CompanyEntityType = "PL_KRS" | "PL_CEIDG" | "OTHER_PL" | "FOREIGN";
export type VerificationStatus = "NOT_STARTED" | "FETCHING" | "COMPANY_VERIFIED" | "EMAIL_VERIFICATION_REQUIRED" | "EMAIL_VERIFIED" | "REPRESENTATION_CHECK_REQUIRED" | "SECOND_SIGNER_REQUIRED" | "POWER_OF_ATTORNEY_REQUIRED" | "MANUAL_REVIEW_REQUIRED" | "VERIFIED" | "REJECTED" | "REGISTRY_UNAVAILABLE";

export type LegalEntitySnapshot = {
  code: string;
  legalName: string;
  companyNumber?: string | null;
  taxId?: string | null;
  registryNumber?: string | null;
  regon?: string | null;
  addressLine1: string;
  postalCode?: string | null;
  city: string;
  countryCode: string;
};

export type MarketCatalog = {
  id: string;
  code: MarketCode;
  currency: Currency;
  activationFeeOpenMinor: number;
  activationFeeAnnualMinor: number;
  activationStripeProductId: string | null;
  activationStripePriceId: string | null;
  defaultDeploymentDays: number;
  seller: LegalEntitySnapshot;
  technologyProvider: LegalEntitySnapshot;
  legalConfigurationComplete: boolean;
};

export type CatalogPrice = {
  id: string;
  amountMinor: number;
  currency: Currency;
  paymentType: PaymentType;
  version: number;
  stripePriceId: string | null;
  stripeProductId: string | null;
  effectiveFrom: string;
};

export type PlanCatalogItem = {
  id: string;
  internalKey: string;
  name: string;
  description: string;
  benefits: string[];
  includedFeatures: string[];
  includedAddonIds: string[];
  recommended: boolean;
  displayOrder: number;
  deploymentDays: number;
  prices: CatalogPrice[];
};

export type AddonCatalogItem = {
  id: string;
  internalKey: string;
  name: string;
  description: string;
  paymentType: PaymentType;
  standalone: boolean;
  minQuantity: number;
  maxQuantity: number;
  deploymentDaysImpact: number;
  displayOrder: number;
  compatiblePlanIds: string[];
  prices: CatalogPrice[];
};

export type CommerceCatalog = {
  market: MarketCatalog;
  language: Locale;
  plans: PlanCatalogItem[];
  addons: AddonCatalogItem[];
  documentVersions: Record<"AGREEMENT" | "TERMS" | "DPA" | "PRIVACY", { id: string; version: number; contentHash: string }> | null;
  checkoutReady: boolean;
  blockers: string[];
};

export type AddonSelection = { addonId: string; quantity: number };
export type OrderSelection = {
  market: MarketCode;
  language: Locale;
  contractTerm: ContractTerm;
  registrationCountry: string;
  billingCountry: string;
  planId: string | null;
  addons: AddonSelection[];
};

export type ClientLegalData = {
  legalName: string;
  legalForm: string;
  registrationCountry: string;
  registeredAddress: string;
  postalCode: string;
  city: string;
  billingAddressDifferent: boolean;
  billingAddress?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry: string;
  taxId: string;
  companyNumber?: string;
  entityType: CompanyEntityType;
  registryName?: string;
  representativeName: string;
  representativePosition: string;
  representativeAuthorityBasis: string;
  businessEmail: string;
  phone: string;
  brandName: string;
  domain?: string;
  appName: string;
  communicationLanguage: Locale;
  authorityConfirmed: boolean;
  companyDataConfirmed: boolean;
};

export type CompanyVerificationView = {
  id: string;
  status: VerificationStatus;
  companyResult: string;
  representativeResult: string;
  emailResult: string;
  reasonCode: string | null;
  reasonDetail: string | null;
  adapter: string;
  entityType: CompanyEntityType;
  legalName: string | null;
  registrationNumber: string | null;
  taxNumber: string | null;
  regon: string | null;
  registryName: string | null;
  registryCountry: string;
  registeredAddress: string | null;
  postalCode: string | null;
  city: string | null;
  entityTypeName: string | null;
  registryStatus: string | null;
  representationMethod: string | null;
  verificationSource: string | null;
  verifiedAt: string | null;
  clientConfirmed: boolean;
  emailVerified: boolean;
};

export type QuoteLine = {
  itemType: "PLAN" | "ADDON" | "ACTIVATION";
  catalogItemId: string | null;
  priceVersionId: string | null;
  name: string;
  paymentType: PaymentType;
  quantity: number;
  unitAmountMinor: number;
  totalAmountMinor: number;
  stripePriceId: string | null;
  included: boolean;
};

export type CommerceQuote = {
  market: MarketCatalog;
  language: Locale;
  currency: Currency;
  contractTerm: ContractTerm;
  lines: QuoteLine[];
  monthlyNetMinor: number;
  oneTimeNetMinor: number;
  activationFeeMinor: number;
  estimatedTaxMinor: number | null;
  dueTodayNetMinor: number;
  nextMonthlyNetMinor: number;
  annualCommitmentNetMinor: number | null;
  deploymentDays: number;
  fingerprint: string;
};
