# Timzy contract and billing architecture

## Status and release gate

This implementation is local and test-only. It deliberately rejects every Stripe secret that does not start with `sk_test_`. No production payment, panel or contract flow has been deployed.

The public flow remains blocked until all of the following are true for a selected market and language:

- the seller has complete legal data;
- at least one plan or standalone add-on is active;
- active versioned prices exist and have Stripe Product and Price IDs;
- the agreement, terms, DPA and privacy documents are active and have a legal approval reference;
- Stripe sandbox keys, webhook secrets, encryption and session secrets are configured.

The Polish seller is intentionally incomplete because the postal code for `al. Jana Pawła II 27, Warszawa` was not supplied. It must not be invented.

## Existing project and new components

The existing site is a React/Next application built with vinext. `worker/index.ts` is the Cloudflare Worker entry point and already contained the contact form, CAPTCHA and SMTP transport. The site also has a static CyberFolks release path. That static path cannot safely host the contract, database, document or Stripe workflow.

The contract system adds:

- a multilingual 12-stage public flow at `/contract/`, `/pl/umowa/` and `/es/contrato/`;
- D1-backed catalogue, drafts, immutable snapshots, clickwrap evidence, Stripe event deduplication, queues and audit data;
- R2-backed AES-GCM encrypted PDFs with SHA-256 integrity hashes;
- post-payment document access through the authenticated order session or a short-lived signed customer link, with every download logged;
- separate Stripe sandbox credentials for the Polish and international seller, with isolated EUR and GBP price catalogues on the international account;
- a hosted Stripe Checkout session created only after clickwrap acceptance;
- a webhook-authoritative payment state machine;
- idempotent provisioning and email jobs;
- an administration panel with roles, password hashing, TOTP MFA, HttpOnly sessions, CSRF, lockout and audit logs;
- consent-aware `dataLayer` events with no customer or Stripe identifiers;
- CSP and security headers at the Worker boundary.

## Data model

The Drizzle schema and generated migrations define 28 tables:

- catalogue: `legal_entities`, `markets`, `plans`, `plan_translations`, `plan_prices`, `addons`, `addon_translations`, `addon_prices`, `plan_included_addons`, `addon_compatible_plans`;
- legal versioning: `contract_templates`, `contract_versions`;
- order evidence: `orders`, `order_items`, `order_price_snapshots`, `order_changes`, `contract_acceptances`, `contract_documents`, `document_access_logs`;
- external processing: `stripe_events`, `provisioning_jobs`, `email_notifications`, `deployment_statuses`;
- administration and security: `admin_users`, `admin_sessions`, `login_attempts`, `rate_limits`, `audit_logs`.

Prices are append-only versions. Publishing a new version archives the earlier active catalogue price and never updates an existing order or Stripe subscription. Accepted orders contain an encrypted canonical document bundle and immutable price/document hashes. Poland uses PLN, the United Kingdom uses GBP, and other international countries use EUR. Markets also carry a configurable default implementation time, while plans and add-ons can override or extend it.

## Required environment values

Copy `.env.example` to a local ignored environment file and supply:

- `APP_BASE_URL`, `APP_ENV`;
- `ADMIN_MFA_REQUIRED=false` only for local development; `APP_ENV=production` always forces MFA;
- `DATA_ENCRYPTION_KEY`: base64url encoding of exactly 32 random bytes;
- `SESSION_SECRET`: at least 32 random characters;
- `CAPTCHA_SECRET`;
- `STRIPE_PL_SECRET_KEY`, `STRIPE_PL_WEBHOOK_SECRET`;
- `STRIPE_INTERNATIONAL_SECRET_KEY`, `STRIPE_INTERNATIONAL_WEBHOOK_SECRET`;
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`;
- `CONTACT_TO`, `NEW_CONTRACT_NOTIFICATION_EMAIL`;
- optional `PROVISIONING_WEBHOOK_URL` and `PROVISIONING_WEBHOOK_SECRET`.

Do not commit `.env` files or paste secrets into catalogue fields, logs or source code.

## Stripe sandbox configuration

Create Products and Prices independently on the two seller accounts. Each monthly item needs a recurring monthly Price in the market currency. Each setup fee and one-time add-on needs a one-time Price. Record the IDs in the administration panel. The product tax code and price tax behaviour must be reviewed with the accountant before publishing.

The implementation follows the Stripe Checkout model in which `mode=subscription` is used whenever a recurring item exists; one-time Prices in that session are placed only on the initial invoice. Stripe Tax is enabled, a server-created Customer contains the confirmed billing address, and tax IDs are collected where supported.

Configure these sandbox webhook endpoints on the matching accounts:

- Polish seller: `/api/stripe/webhook/pl`
- International seller: `/api/stripe/webhook/international`

Subscribe both endpoints to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

The webhook verifies the raw body and signature, records each event ID once and is the only path that can mark an order paid. It stores the final tax and gross amount reported by Stripe separately from the accepted pre-payment net quote. A completed duplicate is ignored, while a previously failed event can be safely reclaimed and retried. The success page only polls internal state.

Official implementation references: [Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create), [subscription Checkout](https://docs.stripe.com/payments/checkout/build-subscriptions), [Stripe Tax in Checkout](https://docs.stripe.com/tax/checkout), [webhook signatures](https://docs.stripe.com/webhooks/signature).

## Local administration bootstrap

No administrator credentials are seeded. Generate a SQL insert locally without writing the password or TOTP secret to the repository:

```bash
TIMZY_ADMIN_EMAIL=admin@example.com \
TIMZY_ADMIN_NAME='Administrator' \
TIMZY_ADMIN_PASSWORD='use-a-long-password-here' \
TIMZY_ADMIN_TOTP_SECRET='BASE32SECRET' \
TIMZY_ADMIN_ROLE=SUPER_ADMIN \
DATA_ENCRYPTION_KEY='the-same-local-key' \
npm run admin:bootstrap
```

Execute the emitted SQL against the local D1 database. Configure the same TOTP secret in an authenticator before attempting to sign in.

## Retention, backup and recovery

The current default policy is a technical starting point, not legal advice:

- unpaid drafts are expired and their customer data is removed after 30 days;
- contract PDFs have a seven-year retention timestamp;
- login attempts are retained for 180 days;
- expired sessions and rate-limit rows are cleaned up;
- every retention run requires `SUPER_ADMIN` and is audited.

The seven-year contract retention period must be confirmed for each seller and applicable accounting/legal regime. Before production, configure scheduled encrypted D1 exports and R2 versioning/backups, document access controls, and run a restore exercise into an isolated environment. A backup is not accepted until a sampled order, acceptance row, price snapshot and encrypted PDF can be restored and its hash verified.

## Values still requiring approval

Business and accounting:

- all plan and add-on prices in PLN, GBP and EUR;
- Stripe Products, Prices, statement descriptors and seller account ownership;
- Stripe Tax registrations, product tax codes, tax behaviour and invoice language;
- treatment of early termination during the 12-month commitment;
- whether and how existing subscriptions may be migrated to new prices;
- provisioning endpoint contract and retry ownership.

Legal:

- the complete postal code and legal address for 7Software;
- final agreement, terms, DPA and privacy wording in PL, EN and ES;
- authority and clickwrap evidence requirements;
- English-law/jurisdiction clause in each translated document;
- processor/controller roles and actual production-data access;
- retention periods, deletion exceptions and international transfers;
- limitation of liability and early termination settlement.

Operational:

- tested SMTP settings and sender authentication;
- the real onboarding/provisioning integration;
- alerting, backups and restore ownership;
- production rate limits and incident response;
- a final accessibility and browser review.

## Deployment boundary

Do not publish the contract routes through the static CyberFolks release. They require the Worker, D1 and R2 bindings. A future deployment must first pass the sandbox Stripe matrix, migration rehearsal, backup restore, accessibility review, legal approval and accounting approval. Production Stripe remains code-blocked until a separate decision explicitly removes the test-key guard.
