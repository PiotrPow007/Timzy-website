UPDATE `plan_translations`
SET `name` = 'Basic',
    `description` = 'Podstawowy pakiet Timzy z rezerwacjami, kalendarzem zespołu i historią klientów.'
WHERE `plan_id` = 'plan_timzy_core' AND `language` = 'pl';

UPDATE `plan_translations`
SET `name` = 'Basic',
    `description` = 'The Basic Timzy package with bookings, team calendar and client history.'
WHERE `plan_id` = 'plan_timzy_core' AND `language` = 'en';

UPDATE `plan_translations`
SET `name` = 'Basic',
    `description` = 'El paquete Basic de Timzy con reservas, agenda del equipo e historial de clientes.'
WHERE `plan_id` = 'plan_timzy_core' AND `language` = 'es';

INSERT INTO `plan_prices` (`id`, `plan_id`, `market_id`, `currency`, `payment_type`, `amount_minor`, `version`, `effective_from`, `status`)
VALUES
  ('plan_price_basic_pl_v1', 'plan_timzy_core', 'market_pl', 'PLN', 'MONTHLY', 12900, 1, '2026-08-17T00:00:00.000Z', 'DRAFT'),
  ('plan_price_basic_international_v1', 'plan_timzy_core', 'market_international', 'EUR', 'MONTHLY', 3900, 1, '2026-08-17T00:00:00.000Z', 'DRAFT');
