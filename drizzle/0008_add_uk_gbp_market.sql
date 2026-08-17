-- The UK has its own GBP price catalogue while sharing the international
-- seller and Stripe test account. Legal documents reuse the international
-- document scope, so no duplicate contract templates are created here.
INSERT OR IGNORE INTO `markets` (`id`, `code`, `currency`, `seller_id`, `technology_provider_id`, `activation_fee_open_minor`, `activation_fee_annual_minor`, `billing_countries_json`, `stripe_account_key`, `status`)
VALUES ('market_uk', 'UK', 'GBP', 'entity_innovare', 'entity_innovare', 9900, 0, '["GB"]', 'INTERNATIONAL', 'ACTIVE');

INSERT OR IGNORE INTO `plan_prices` (`id`, `plan_id`, `market_id`, `currency`, `payment_type`, `amount_minor`, `version`, `effective_from`, `status`)
VALUES ('plan_price_basic_uk_v1', 'plan_timzy_core', 'market_uk', 'GBP', 'MONTHLY', 3900, 1, '2026-08-17T00:00:00.000Z', 'DRAFT');
