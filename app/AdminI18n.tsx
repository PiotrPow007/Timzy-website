"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminLocale } from "./AdminI18nUtils";

const en = {
  language: "Language", polish: "Polski", english: "English",
  requestFailed: "Request failed", panelUnavailable: "Panel data unavailable", saved: "Saved and recorded in the audit log.", saveFailed: "Save failed",
  verifyingSession: "Verifying administrator session…", signOut: "Sign out",
  navOverview: "Overview", navCatalog: "Plans & add-ons", navPrices: "Prices & markets", navDocuments: "Documents", navOrders: "Orders",
  operations: "OPERATIONS", contractOperations: "Contract operations", exportCsv: "Export CSV", emailQueue: "Email queue", provisioning: "Provisioning",
  versionedCatalogue: "VERSIONED CATALOGUE", plansAndAddons: "Plans and add-ons", createPlan: "Create plan", internalKey: "internal-key",
  includedFeature: "One included feature per line", recommended: "Recommended", createDraftPlan: "Create draft plan", createAddon: "Create add-on",
  maximumQuantity: "Maximum quantity", deploymentDaysImpact: "Additional deployment days",
  monthly: "Monthly", oneTime: "One-time", standalone: "Can be purchased without a plan", createDraftAddon: "Create draft add-on",
  assignAddons: "Assign included and compatible add-ons", includedAddonIds: "Included add-on IDs, comma-separated", compatibleAddonIds: "Other compatible add-on IDs, comma-separated", savePlanMapping: "Save plan mapping",
  pricingHelpTitle: "Where do I set prices?", pricingHelpText: "Open Prices & markets or use Set price next to a plan or add-on. Every change creates a new price version instead of overwriting order history.", goToPrices: "Go to prices", setPrice: "Set price",
  plans: "Plans", addons: "Add-ons", noOverwrites: "NO OVERWRITES", priceMarketsSellers: "Price versions, markets and sellers",
  createPriceVersion: "Set a plan or add-on price", plan: "Plan", addon: "Add-on", itemId: "Plan or add-on", offerType: "Offer type", marketAndCurrency: "Market and currency", paymentSchedule: "Payment schedule", netAmount: "Net amount", amountExample: "For example 399.00", createDraftPrice: "Save draft price",
  priceVersionHelp: "Choose an item and market, then enter the normal amount in PLN, GBP or EUR. The system stores it safely as a versioned price.", stripeHelp: "Leave both Stripe fields empty to create a test Product and Price automatically. Publish the draft only after checking the amount and currency.",
  stripeProduct: "Stripe Product ID", stripePrice: "Stripe Price ID", annualActivationFee: "12-month activation fee", activationProduct: "Activation Product ID", activationPrice: "Activation Price ID",
  marketConfiguration: "Market configuration", defaultDeploymentDays: "Default deployment days", seller: "Seller", technologyProvider: "Technology provider",
  billingCountries: "Billing country codes, comma-separated", openActivationFee: "Open-ended activation fee", saveMarket: "Save market configuration",
  editEntity: "Edit seller or technology provider", legalName: "Legal name", companyNumber: "Company number", taxId: "Tax ID", registryNumber: "Registry number",
  address: "Address", postalCode: "Postal code", city: "City", countryCode: "Country code", saveEntity: "Save legal entity",
  markets: "Markets", legalEntities: "Legal entities", planPrices: "Plan prices", addonPrices: "Add-on prices",
  legalVersionControl: "LEGAL VERSION CONTROL", contractDocuments: "Contract documents", documentTitle: "Document title", documentParagraphs: "Paragraphs separated by a blank line", createDocumentVersion: "Create immutable draft version",
  immutableHistory: "IMMUTABLE HISTORY", noRecords: "No records.", key: "Key", status: "Status", displayOrder: "Order", actions: "Actions",
  activate: "Activate", draft: "Draft", archive: "Archive", item: "Item", amount: "Amount", version: "Version", publish: "Publish",
  documentVersions: "Document versions", template: "Template", effective: "Effective", legalApprovalReference: "Legal approval reference",
  secureAdministration: "SECURE ADMINISTRATION", signIn: "Sign in to Timzy", verifyMfa: "Verify MFA",
  loginDescription: "Access is verified on the server. The same response is shown for unknown accounts and incorrect credentials.",
  mfaDescription: "Enter the six-digit code from the authenticator configured for this administrator.", businessEmail: "Business email", password: "Password", authenticatorCode: "Authenticator code",
  verifying: "Verifying…", continue: "Continue", verifyAndOpen: "Verify and open panel", securityUnavailable: "Panel security service is unavailable.", authenticationFailed: "Authentication failed",
  loadingOrder: "Loading secured order…", administration: "Administration", orderEvidence: "ORDER EVIDENCE", retryProvisioning: "Retry provisioning", resendNotifications: "Resend notifications", actionFailed: "Action failed", orderUnavailable: "Order unavailable",
  addDeploymentStatus: "Add deployment status", expectedStart: "Expected start date", expectedReady: "Expected ready date", googleStatus: "Google Play status", appleStatus: "Apple App Store status", internalNote: "Internal note", recordStatus: "Record status",
  order: "Order", immutableItems: "Immutable line items", clickwrapAcceptance: "Clickwrap acceptance", download: "download", deploymentHistory: "Deployment history", emailHistory: "Email history", auditLog: "Audit log",
  companyVerification: "Company verification", verificationHistory: "Verification status history", verificationDocuments: "Verification documents", signers: "Signers", verificationDecision: "Manual verification decision", decisionReason: "Detailed reason (required)", saveDecision: "Save verification decision",
} as const;

type AdminTextKey = keyof typeof en;

const pl: Record<AdminTextKey, string> = {
  language: "Język", polish: "Polski", english: "English",
  requestFailed: "Nie udało się wykonać żądania", panelUnavailable: "Dane panelu są niedostępne", saved: "Zapisano i odnotowano w dzienniku audytowym.", saveFailed: "Nie udało się zapisać",
  verifyingSession: "Weryfikowanie sesji administratora…", signOut: "Wyloguj się",
  navOverview: "Przegląd", navCatalog: "Plany i dodatki", navPrices: "Ceny i rynki", navDocuments: "Dokumenty", navOrders: "Zamówienia",
  operations: "OPERACJE", contractOperations: "Obsługa umów", exportCsv: "Eksportuj CSV", emailQueue: "Kolejka e-mail", provisioning: "Wdrożenia",
  versionedCatalogue: "KATALOG WERSJONOWANY", plansAndAddons: "Plany i dodatki", createPlan: "Utwórz plan", internalKey: "klucz-wewnętrzny",
  includedFeature: "Jedna funkcja w pakiecie na wiersz", recommended: "Polecany", createDraftPlan: "Utwórz szkic planu", createAddon: "Utwórz dodatek",
  maximumQuantity: "Maksymalna ilość", deploymentDaysImpact: "Dodatkowe dni wdrożenia",
  monthly: "Miesięcznie", oneTime: "Jednorazowo", standalone: "Można kupić bez planu", createDraftAddon: "Utwórz szkic dodatku",
  assignAddons: "Przypisz dodatki zawarte i kompatybilne", includedAddonIds: "Identyfikatory dodatków zawartych w cenie, oddzielone przecinkami", compatibleAddonIds: "Identyfikatory innych kompatybilnych dodatków, oddzielone przecinkami", savePlanMapping: "Zapisz powiązania planu",
  pricingHelpTitle: "Gdzie ustawia się ceny?", pricingHelpText: "Otwórz sekcję Ceny i rynki albo użyj przycisku Ustaw cenę przy planie lub dodatku. Każda zmiana tworzy nową wersję ceny i nie nadpisuje historii zamówień.", goToPrices: "Przejdź do cen", setPrice: "Ustaw cenę",
  plans: "Plany", addons: "Dodatki", noOverwrites: "BEZ NADPISYWANIA", priceMarketsSellers: "Wersje cen, rynki i sprzedawcy",
  createPriceVersion: "Ustaw cenę planu lub dodatku", plan: "Plan", addon: "Dodatek", itemId: "Plan lub dodatek", offerType: "Rodzaj oferty", marketAndCurrency: "Rynek i waluta", paymentSchedule: "Sposób rozliczenia", netAmount: "Kwota netto", amountExample: "Na przykład 399,00", createDraftPrice: "Zapisz szkic ceny",
  priceVersionHelp: "Wybierz pozycję i rynek, a następnie wpisz zwykłą kwotę w PLN, GBP lub EUR. System bezpiecznie zapisze ją jako wersjonowaną cenę.", stripeHelp: "Zostaw oba pola Stripe puste, aby automatycznie utworzyć testowy Product i Price. Opublikuj szkic dopiero po sprawdzeniu kwoty i waluty.",
  stripeProduct: "ID produktu Stripe", stripePrice: "ID ceny Stripe", annualActivationFee: "Opłata aktywacyjna dla umowy 12-miesięcznej", activationProduct: "ID produktu aktywacyjnego", activationPrice: "ID ceny aktywacyjnej",
  marketConfiguration: "Konfiguracja rynku", defaultDeploymentDays: "Domyślna liczba dni wdrożenia", seller: "Sprzedawca", technologyProvider: "Dostawca technologii",
  billingCountries: "Kody krajów rozliczeniowych, oddzielone przecinkami", openActivationFee: "Opłata aktywacyjna dla umowy bezterminowej", saveMarket: "Zapisz konfigurację rynku",
  editEntity: "Edytuj sprzedawcę lub dostawcę technologii", legalName: "Nazwa prawna", companyNumber: "Numer spółki", taxId: "NIP / VAT ID", registryNumber: "Numer rejestrowy",
  address: "Adres", postalCode: "Kod pocztowy", city: "Miasto", countryCode: "Kod kraju", saveEntity: "Zapisz podmiot prawny",
  markets: "Rynki", legalEntities: "Podmioty prawne", planPrices: "Ceny planów", addonPrices: "Ceny dodatków",
  legalVersionControl: "WERSJONOWANIE PRAWNE", contractDocuments: "Dokumenty umowne", documentTitle: "Tytuł dokumentu", documentParagraphs: "Akapity oddzielone pustym wierszem", createDocumentVersion: "Utwórz niezmienny szkic wersji",
  immutableHistory: "NIEZMIENNA HISTORIA", noRecords: "Brak rekordów.", key: "Klucz", status: "Status", displayOrder: "Kolejność", actions: "Działania",
  activate: "Aktywuj", draft: "Szkic", archive: "Archiwizuj", item: "Pozycja", amount: "Kwota", version: "Wersja", publish: "Opublikuj",
  documentVersions: "Wersje dokumentów", template: "Szablon", effective: "Obowiązuje od", legalApprovalReference: "Numer akceptacji prawnej",
  secureAdministration: "BEZPIECZNA ADMINISTRACJA", signIn: "Zaloguj się do Timzy", verifyMfa: "Potwierdź MFA",
  loginDescription: "Dane logowania są weryfikowane na serwerze. Dla nieznanego konta i błędnego hasła wyświetlany jest ten sam komunikat.",
  mfaDescription: "Wpisz sześciocyfrowy kod z aplikacji uwierzytelniającej skonfigurowanej dla tego administratora.", businessEmail: "E-mail służbowy", password: "Hasło", authenticatorCode: "Kod z aplikacji uwierzytelniającej",
  verifying: "Weryfikowanie…", continue: "Dalej", verifyAndOpen: "Potwierdź i otwórz panel", securityUnavailable: "Usługa bezpieczeństwa panelu jest niedostępna.", authenticationFailed: "Logowanie nie powiodło się",
  loadingOrder: "Wczytywanie zabezpieczonego zamówienia…", administration: "Administracja", orderEvidence: "DOWODY ZAMÓWIENIA", retryProvisioning: "Ponów wdrożenie", resendNotifications: "Wyślij powiadomienia ponownie", actionFailed: "Nie udało się wykonać działania", orderUnavailable: "Zamówienie jest niedostępne",
  addDeploymentStatus: "Dodaj status wdrożenia", expectedStart: "Przewidywana data rozpoczęcia", expectedReady: "Przewidywana data gotowości", googleStatus: "Status Google Play", appleStatus: "Status Apple App Store", internalNote: "Notatka wewnętrzna", recordStatus: "Zapisz status",
  order: "Zamówienie", immutableItems: "Niezmienne pozycje", clickwrapAcceptance: "Akceptacja clickwrap", download: "pobierz", deploymentHistory: "Historia wdrożenia", emailHistory: "Historia wiadomości", auditLog: "Dziennik audytowy",
  companyVerification: "Weryfikacja firmy", verificationHistory: "Historia statusów weryfikacji", verificationDocuments: "Dokumenty weryfikacyjne", signers: "Osoby podpisujące", verificationDecision: "Ręczna decyzja weryfikacyjna", decisionReason: "Szczegółowe uzasadnienie (wymagane)", saveDecision: "Zapisz decyzję weryfikacyjną",
};

const translations = { en, pl };

export function useAdminI18n() {
  const [locale, setLocaleState] = useState<AdminLocale>("pl");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("timzy_admin_language");
      const next: AdminLocale = stored === "en" || stored === "pl" ? stored : navigator.language.toLowerCase().startsWith("pl") ? "pl" : "en";
      setLocaleState(next); document.documentElement.lang = next;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const setLocale = useCallback((next: AdminLocale) => { setLocaleState(next); window.localStorage.setItem("timzy_admin_language", next); document.documentElement.lang = next; }, []);
  const t = useCallback((key: AdminTextKey) => translations[locale][key], [locale]);
  return { locale, setLocale, t };
}

export function AdminLanguageSwitch({ locale, setLocale }: { locale: AdminLocale; setLocale: (locale: AdminLocale) => void }) {
  const label = translations[locale].language;
  return <div className="admin-language-switch" role="group" aria-label={label}><span>{label}</span><button type="button" className={locale === "pl" ? "is-active" : ""} aria-pressed={locale === "pl"} onClick={() => setLocale("pl")}>PL</button><button type="button" className={locale === "en" ? "is-active" : ""} aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>;
}
