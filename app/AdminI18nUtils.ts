export type AdminLocale = "pl" | "en";

const statusPl: Record<string, string> = {
  DRAFT: "Szkic", ACTIVE: "Aktywny", ARCHIVED: "Zarchiwizowany", PAID: "Opłacone", PENDING_PAYMENT: "Oczekuje na płatność", PAYMENT_FAILED: "Płatność nieudana",
  PROVISIONING: "Wdrażanie", CANCELLED: "Anulowane", EXPIRED: "Wygasłe", QUEUED: "W kolejce", RUNNING: "W toku", SUCCEEDED: "Zakończone", FAILED: "Nieudane", SENT: "Wysłane", SENDING: "Wysyłanie",
  AWAITING_PAYMENT: "Oczekiwanie na płatność", AWAITING_CLIENT_DATA: "Oczekiwanie na dane klienta", CLIENT_DATA_COMPLETE: "Dane klienta kompletne", IMPLEMENTATION_STARTED: "Wdrożenie rozpoczęte",
  CONFIGURATION: "Konfiguracja", TESTING: "Testy", AWAITING_CLIENT_APPROVAL: "Oczekiwanie na akceptację klienta", SUBMITTED_GOOGLE_PLAY: "Wysłano do Google Play", SUBMITTED_APPLE_APP_STORE: "Wysłano do Apple App Store",
  AWAITING_STORE_DECISION: "Oczekiwanie na decyzję sklepu", PUBLISHED: "Opublikowane", IMPLEMENTATION_COMPLETED: "Wdrożenie zakończone", IMPLEMENTATION_PAUSED: "Wdrożenie wstrzymane",
  NOT_STARTED: "Nie rozpoczęto", FETCHING: "Pobieranie danych", COMPANY_VERIFIED: "Firma zweryfikowana", EMAIL_VERIFICATION_REQUIRED: "Wymagane potwierdzenie e-maila", EMAIL_VERIFIED: "E-mail potwierdzony", REPRESENTATION_CHECK_REQUIRED: "Wymagane sprawdzenie reprezentacji", SECOND_SIGNER_REQUIRED: "Wymagany drugi podpisujący", POWER_OF_ATTORNEY_REQUIRED: "Wymagane pełnomocnictwo", MANUAL_REVIEW_REQUIRED: "Wymagana ręczna weryfikacja", VERIFIED: "Zweryfikowano", REJECTED: "Odrzucono", REGISTRY_UNAVAILABLE: "Rejestr niedostępny",
};

export function adminStatusLabel(value: unknown, locale: AdminLocale): string { const raw = String(value ?? ""); return locale === "pl" ? statusPl[raw] ?? raw : raw; }

const columnsPl: Record<string, string> = { id: "ID", status: "Status", count: "Liczba", currency: "Waluta", market_code: "Rynek", created_at: "Utworzono", updated_at: "Zmieniono", notification_type: "Typ powiadomienia", processing_status: "Status przetwarzania", amount_minor: "Kwota", order_number: "Numer zamówienia" };
export function adminColumnLabel(column: string, locale: AdminLocale): string { return locale === "pl" ? columnsPl[column] ?? column.replaceAll("_", " ") : column.replaceAll("_", " "); }
