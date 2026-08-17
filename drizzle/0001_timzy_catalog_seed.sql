-- Initial business configuration. Missing business prices and legally approved
-- documents intentionally remain DRAFT and therefore cannot be sold.
INSERT INTO legal_entities (id, code, legal_name, company_number, tax_id, registry_number, regon, address_line_1, postal_code, city, country_code, technology_provider, status)
VALUES
  ('entity_7software', '7SOFTWARE', '7Software sp. z o.o.', NULL, '5272813760', '0000687703', '367876297', 'al. Jana Pawła II 27', NULL, 'Warszawa', 'PL', 0, 'DRAFT'),
  ('entity_innovare', 'INNOVARE', 'INNOVARE GROUP LTD', '12878269', NULL, NULL, NULL, '7 Bell Yard', 'WC2A 2JR', 'London', 'GB', 1, 'ACTIVE');

INSERT INTO markets (id, code, currency, seller_id, technology_provider_id, activation_fee_open_minor, activation_fee_annual_minor, billing_countries_json, stripe_account_key, status)
VALUES
  ('market_pl', 'PL', 'PLN', 'entity_7software', 'entity_innovare', 35900, 0, '["PL"]', 'PL', 'ACTIVE'),
  ('market_international', 'INTERNATIONAL', 'EUR', 'entity_innovare', 'entity_innovare', 9900, 0, '["*"]', 'INTERNATIONAL', 'ACTIVE');

INSERT INTO plans (id, internal_key, included_features_json, recommended, display_order, deployment_days, status)
VALUES ('plan_timzy_core', 'timzy-core', '["bookings","calendar","client-history"]', 1, 10, 7, 'DRAFT');

INSERT INTO plan_translations (plan_id, language, name, description, benefits_json)
VALUES
  ('plan_timzy_core', 'pl', 'Timzy Core', 'Podstawowy pakiet Timzy wymagający zatwierdzenia ceny przed publikacją.', '["Rezerwacje","Kalendarz zespołu","Historia klientów"]'),
  ('plan_timzy_core', 'en', 'Timzy Core', 'The core Timzy package. A business-approved price is required before publication.', '["Bookings","Team calendar","Client history"]'),
  ('plan_timzy_core', 'es', 'Timzy Core', 'El paquete base de Timzy. Requiere un precio aprobado antes de publicarse.', '["Reservas","Agenda del equipo","Historial de clientes"]');

INSERT INTO addons (id, internal_key, payment_type, standalone, min_quantity, max_quantity, deployment_days_impact, display_order, status)
VALUES
  ('addon_shop', 'online-shop', 'MONTHLY', 0, 1, 1, 2, 10, 'DRAFT'),
  ('addon_vouchers', 'vouchers', 'MONTHLY', 0, 1, 1, 1, 20, 'DRAFT'),
  ('addon_full_payment', 'booking-full-payment', 'MONTHLY', 0, 1, 1, 1, 30, 'DRAFT'),
  ('addon_deposit', 'booking-deposit', 'MONTHLY', 0, 1, 1, 1, 40, 'DRAFT'),
  ('addon_website', 'additional-website', 'ONE_TIME', 1, 1, 5, 3, 50, 'DRAFT'),
  ('addon_location', 'additional-location', 'MONTHLY', 0, 1, 20, 1, 60, 'DRAFT'),
  ('addon_employee', 'additional-employee', 'MONTHLY', 0, 1, 100, 0, 70, 'DRAFT'),
  ('addon_integration', 'external-integration', 'ONE_TIME', 0, 1, 10, 5, 80, 'DRAFT'),
  ('addon_language', 'additional-language', 'ONE_TIME', 0, 1, 10, 2, 90, 'DRAFT'),
  ('addon_custom', 'custom-module', 'ONE_TIME', 0, 1, 10, 7, 100, 'DRAFT'),
  ('addon_onboarding', 'individual-onboarding', 'ONE_TIME', 1, 1, 10, 2, 110, 'DRAFT'),
  ('addon_branding', 'branding', 'ONE_TIME', 1, 1, 5, 3, 120, 'DRAFT'),
  ('addon_qr_nfc', 'qr-nfc', 'ONE_TIME', 1, 1, 100, 1, 130, 'DRAFT'),
  ('addon_reports', 'additional-reports', 'MONTHLY', 0, 1, 20, 2, 140, 'DRAFT'),
  ('addon_automation', 'automation', 'MONTHLY', 0, 1, 20, 2, 150, 'DRAFT');

INSERT INTO addon_translations (addon_id, language, name, description)
SELECT id, 'pl',
  CASE internal_key
    WHEN 'online-shop' THEN 'Sklep internetowy' WHEN 'vouchers' THEN 'Vouchery' WHEN 'booking-full-payment' THEN 'Płatność całościowa za rezerwację'
    WHEN 'booking-deposit' THEN 'Zaliczka za rezerwację' WHEN 'additional-website' THEN 'Dodatkowa strona WWW' WHEN 'additional-location' THEN 'Dodatkowa lokalizacja'
    WHEN 'additional-employee' THEN 'Dodatkowy pracownik' WHEN 'external-integration' THEN 'Integracja zewnętrzna' WHEN 'additional-language' THEN 'Dodatkowy język'
    WHEN 'custom-module' THEN 'Dedykowany moduł' WHEN 'individual-onboarding' THEN 'Indywidualne wdrożenie' WHEN 'branding' THEN 'Branding'
    WHEN 'qr-nfc' THEN 'Materiały QR lub NFC' WHEN 'additional-reports' THEN 'Dodatkowe raporty' ELSE 'Automatyzacje' END,
  'Pozycja katalogowa wymaga zatwierdzenia ceny i publikacji przez administratora.'
FROM addons;

INSERT INTO addon_translations (addon_id, language, name, description)
SELECT id, 'en',
  CASE internal_key
    WHEN 'online-shop' THEN 'Online shop' WHEN 'vouchers' THEN 'Vouchers' WHEN 'booking-full-payment' THEN 'Full booking payment'
    WHEN 'booking-deposit' THEN 'Booking deposit' WHEN 'additional-website' THEN 'Additional website' WHEN 'additional-location' THEN 'Additional location'
    WHEN 'additional-employee' THEN 'Additional employee' WHEN 'external-integration' THEN 'External integration' WHEN 'additional-language' THEN 'Additional language'
    WHEN 'custom-module' THEN 'Custom module' WHEN 'individual-onboarding' THEN 'Individual onboarding' WHEN 'branding' THEN 'Branding'
    WHEN 'qr-nfc' THEN 'QR or NFC materials' WHEN 'additional-reports' THEN 'Additional reports' ELSE 'Automations' END,
  'This catalogue item requires an approved price and publication by an administrator.'
FROM addons;

INSERT INTO addon_translations (addon_id, language, name, description)
SELECT id, 'es',
  CASE internal_key
    WHEN 'online-shop' THEN 'Tienda online' WHEN 'vouchers' THEN 'Vales' WHEN 'booking-full-payment' THEN 'Pago completo de la reserva'
    WHEN 'booking-deposit' THEN 'Depósito de reserva' WHEN 'additional-website' THEN 'Web adicional' WHEN 'additional-location' THEN 'Ubicación adicional'
    WHEN 'additional-employee' THEN 'Empleado adicional' WHEN 'external-integration' THEN 'Integración externa' WHEN 'additional-language' THEN 'Idioma adicional'
    WHEN 'custom-module' THEN 'Módulo a medida' WHEN 'individual-onboarding' THEN 'Implementación individual' WHEN 'branding' THEN 'Branding'
    WHEN 'qr-nfc' THEN 'Materiales QR o NFC' WHEN 'additional-reports' THEN 'Informes adicionales' ELSE 'Automatizaciones' END,
  'Este elemento necesita un precio aprobado y su publicación por un administrador.'
FROM addons;

INSERT INTO addon_compatible_plans (addon_id, plan_id) SELECT id, 'plan_timzy_core' FROM addons WHERE standalone = 0;

INSERT INTO contract_templates (id, kind, market_code, language, name)
SELECT 'template_' || lower(kind) || '_' || lower(market_code) || '_' || language, kind, market_code, language,
  kind || ' · ' || market_code || ' · ' || upper(language)
FROM (
  SELECT 'AGREEMENT' AS kind UNION ALL SELECT 'TERMS' UNION ALL SELECT 'DPA' UNION ALL SELECT 'PRIVACY'
) kinds
CROSS JOIN (SELECT 'PL' AS market_code UNION ALL SELECT 'INTERNATIONAL') market_codes
CROSS JOIN (SELECT 'pl' AS language UNION ALL SELECT 'en' UNION ALL SELECT 'es') languages;

INSERT INTO contract_versions (id, template_id, version, content_json, content_hash, effective_from, status, legal_approval_reference)
SELECT 'version_' || substr(id, 10), id, 1,
  CASE language
    WHEN 'pl' THEN '{"title":"Wersja robocza dokumentu","sections":["Dokument nie został jeszcze zatwierdzony prawnie i nie może być użyty do zawarcia umowy."]}'
    WHEN 'es' THEN '{"title":"Borrador del documento","sections":["El documento todavía no dispone de aprobación legal y no puede utilizarse para celebrar un contrato."]}'
    ELSE '{"title":"Draft document","sections":["This document has not yet received legal approval and cannot be used to enter into an agreement."]}' END,
  'DRAFT_REQUIRES_PUBLISHING', '2099-01-01T00:00:00.000Z', 'DRAFT', NULL
FROM contract_templates;

PRAGMA optimize;
