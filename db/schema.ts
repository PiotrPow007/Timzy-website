import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const createdAt = () => text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`);
const updatedAt = () => text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`);

export const legalEntities = sqliteTable("legal_entities", {
  id: text("id").primaryKey(), code: text("code").notNull().unique(), legalName: text("legal_name").notNull(),
  companyNumber: text("company_number"), taxId: text("tax_id"), registryNumber: text("registry_number"), regon: text("regon"),
  addressLine1: text("address_line_1").notNull(), postalCode: text("postal_code"), city: text("city").notNull(), countryCode: text("country_code").notNull(),
  technologyProvider: integer("technology_provider", { mode: "boolean" }).notNull().default(false),
  status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"), createdAt: createdAt(), updatedAt: updatedAt(),
});

export const markets = sqliteTable("markets", {
  id: text("id").primaryKey(), code: text("code", { enum: ["PL", "INTERNATIONAL"] }).notNull().unique(),
  currency: text("currency", { enum: ["PLN", "EUR"] }).notNull(), sellerId: text("seller_id").notNull().references(() => legalEntities.id),
  technologyProviderId: text("technology_provider_id").notNull().references(() => legalEntities.id),
  activationFeeOpenMinor: integer("activation_fee_open_minor").notNull(), activationFeeAnnualMinor: integer("activation_fee_annual_minor").notNull().default(0),
  activationStripeProductId: text("activation_stripe_product_id"), activationStripePriceId: text("activation_stripe_price_id"),
  defaultDeploymentDays: integer("default_deployment_days").notNull().default(7),
  billingCountriesJson: text("billing_countries_json").notNull(), stripeAccountKey: text("stripe_account_key").notNull(),
  status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"), createdAt: createdAt(), updatedAt: updatedAt(),
});

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(), internalKey: text("internal_key").notNull().unique(), includedFeaturesJson: text("included_features_json").notNull().default("[]"),
  recommended: integer("recommended", { mode: "boolean" }).notNull().default(false), displayOrder: integer("display_order").notNull().default(0),
  deploymentDays: integer("deployment_days").notNull().default(7), status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("idx_plans_status_order").on(table.status, table.displayOrder)]);

export const planTranslations = sqliteTable("plan_translations", {
  planId: text("plan_id").notNull().references(() => plans.id), language: text("language", { enum: ["pl", "en", "es"] }).notNull(),
  name: text("name").notNull(), description: text("description").notNull(), benefitsJson: text("benefits_json").notNull().default("[]"),
}, (table) => [primaryKey({ columns: [table.planId, table.language] })]);

export const planPrices = sqliteTable("plan_prices", {
  id: text("id").primaryKey(), planId: text("plan_id").notNull().references(() => plans.id), marketId: text("market_id").notNull().references(() => markets.id),
  currency: text("currency", { enum: ["PLN", "EUR"] }).notNull(), paymentType: text("payment_type", { enum: ["MONTHLY", "ONE_TIME"] }).notNull(),
  amountMinor: integer("amount_minor").notNull(), stripeProductId: text("stripe_product_id"), stripePriceId: text("stripe_price_id"), version: integer("version").notNull(),
  effectiveFrom: text("effective_from").notNull(), archivedAt: text("archived_at"), status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"), createdAt: createdAt(),
}, (table) => [uniqueIndex("uq_plan_price_version").on(table.planId, table.marketId, table.paymentType, table.version), index("idx_plan_prices_catalog").on(table.planId, table.marketId, table.status, table.effectiveFrom)]);

export const addons = sqliteTable("addons", {
  id: text("id").primaryKey(), internalKey: text("internal_key").notNull().unique(), paymentType: text("payment_type", { enum: ["MONTHLY", "ONE_TIME"] }).notNull(),
  standalone: integer("standalone", { mode: "boolean" }).notNull().default(false), minQuantity: integer("min_quantity").notNull().default(1), maxQuantity: integer("max_quantity").notNull().default(1),
  deploymentDaysImpact: integer("deployment_days_impact").notNull().default(0), displayOrder: integer("display_order").notNull().default(0),
  status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("idx_addons_status_order").on(table.status, table.displayOrder)]);

export const addonTranslations = sqliteTable("addon_translations", {
  addonId: text("addon_id").notNull().references(() => addons.id), language: text("language", { enum: ["pl", "en", "es"] }).notNull(),
  name: text("name").notNull(), description: text("description").notNull(),
}, (table) => [primaryKey({ columns: [table.addonId, table.language] })]);

export const addonPrices = sqliteTable("addon_prices", {
  id: text("id").primaryKey(), addonId: text("addon_id").notNull().references(() => addons.id), marketId: text("market_id").notNull().references(() => markets.id),
  currency: text("currency", { enum: ["PLN", "EUR"] }).notNull(), amountMinor: integer("amount_minor").notNull(), stripeProductId: text("stripe_product_id"), stripePriceId: text("stripe_price_id"),
  version: integer("version").notNull(), effectiveFrom: text("effective_from").notNull(), archivedAt: text("archived_at"),
  status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"), createdAt: createdAt(),
}, (table) => [uniqueIndex("uq_addon_price_version").on(table.addonId, table.marketId, table.version), index("idx_addon_prices_catalog").on(table.addonId, table.marketId, table.status, table.effectiveFrom)]);

export const planIncludedAddons = sqliteTable("plan_included_addons", {
  planId: text("plan_id").notNull().references(() => plans.id), addonId: text("addon_id").notNull().references(() => addons.id),
}, (table) => [primaryKey({ columns: [table.planId, table.addonId] })]);

export const addonCompatiblePlans = sqliteTable("addon_compatible_plans", {
  addonId: text("addon_id").notNull().references(() => addons.id), planId: text("plan_id").notNull().references(() => plans.id),
}, (table) => [primaryKey({ columns: [table.addonId, table.planId] })]);

export const contractTemplates = sqliteTable("contract_templates", {
  id: text("id").primaryKey(), kind: text("kind", { enum: ["AGREEMENT", "TERMS", "DPA", "PRIVACY"] }).notNull(),
  marketCode: text("market_code", { enum: ["PL", "INTERNATIONAL"] }).notNull(), language: text("language", { enum: ["pl", "en", "es"] }).notNull(),
  name: text("name").notNull(), createdAt: createdAt(),
}, (table) => [uniqueIndex("uq_contract_template_scope").on(table.kind, table.marketCode, table.language)]);

export const contractVersions = sqliteTable("contract_versions", {
  id: text("id").primaryKey(), templateId: text("template_id").notNull().references(() => contractTemplates.id), version: integer("version").notNull(),
  contentJson: text("content_json").notNull(), contentHash: text("content_hash").notNull(), effectiveFrom: text("effective_from").notNull(),
  status: text("status", { enum: ["DRAFT", "ACTIVE", "ARCHIVED"] }).notNull().default("DRAFT"), legalApprovalReference: text("legal_approval_reference"),
  publishedByAdminId: text("published_by_admin_id"), createdAt: createdAt(),
}, (table) => [uniqueIndex("uq_contract_version").on(table.templateId, table.version), index("idx_contract_versions_active").on(table.templateId, table.status, table.effectiveFrom)]);

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), orderNumber: text("order_number").notNull().unique(), publicTokenHash: text("public_token_hash").notNull(),
  status: text("status", { enum: ["DRAFT", "AWAITING_ACCEPTANCE", "PENDING_PAYMENT", "PAID", "PROVISIONING", "ACTIVE", "PAYMENT_FAILED", "CANCELLED", "EXPIRED"] }).notNull().default("DRAFT"),
  marketCode: text("market_code", { enum: ["PL", "INTERNATIONAL"] }), language: text("language", { enum: ["pl", "en", "es"] }), currency: text("currency", { enum: ["PLN", "EUR"] }),
  contractTerm: text("contract_term", { enum: ["ANNUAL_12", "OPEN_ENDED"] }), registrationCountry: text("registration_country"), billingCountry: text("billing_country"),
  selectionJson: text("selection_json").notNull().default("{}"), clientDataEncrypted: text("client_data_encrypted"), clientDataHash: text("client_data_hash"),
  immutableSnapshotJson: text("immutable_snapshot_json"), quoteFingerprint: text("quote_fingerprint"), monthlyNetMinor: integer("monthly_net_minor"),
  oneTimeNetMinor: integer("one_time_net_minor"), activationFeeMinor: integer("activation_fee_minor"), estimatedTaxMinor: integer("estimated_tax_minor"),
  finalTaxMinor: integer("final_tax_minor"), finalTotalMinor: integer("final_total_minor"), dueTodayMinor: integer("due_today_minor"), deploymentDays: integer("deployment_days"), acceptanceRevision: integer("acceptance_revision").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"), stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(), stripeSubscriptionId: text("stripe_subscription_id"),
  stripeInvoiceId: text("stripe_invoice_id"), stripePaymentIntentId: text("stripe_payment_intent_id"), paidAt: text("paid_at"), expiresAt: text("expires_at"),
  verificationStatus: text("verification_status").notNull().default("NOT_STARTED"), companyVerificationId: text("company_verification_id"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("idx_orders_status_created").on(table.status, table.createdAt), index("idx_orders_customer_email_hash").on(table.clientDataHash)]);

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), itemType: text("item_type", { enum: ["PLAN", "ADDON", "ACTIVATION"] }).notNull(),
  catalogItemId: text("catalog_item_id"), priceVersionId: text("price_version_id"), paymentType: text("payment_type", { enum: ["MONTHLY", "ONE_TIME"] }).notNull(),
  quantity: integer("quantity").notNull(), unitAmountMinor: integer("unit_amount_minor").notNull(), totalAmountMinor: integer("total_amount_minor").notNull(),
  stripePriceId: text("stripe_price_id"), snapshotJson: text("snapshot_json").notNull(), createdAt: createdAt(),
}, (table) => [index("idx_order_items_order").on(table.orderId)]);

export const orderPriceSnapshots = sqliteTable("order_price_snapshots", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id).unique(), snapshotJson: text("snapshot_json").notNull(),
  snapshotHash: text("snapshot_hash").notNull(), createdAt: createdAt(),
});

export const orderChanges = sqliteTable("order_changes", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), revision: integer("revision").notNull(),
  changedFieldsJson: text("changed_fields_json").notNull(), previousFingerprint: text("previous_fingerprint"), nextFingerprint: text("next_fingerprint"), createdAt: createdAt(),
}, (table) => [uniqueIndex("uq_order_change_revision").on(table.orderId, table.revision)]);

export const contractAcceptances = sqliteTable("contract_acceptances", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), revision: integer("revision").notNull(),
  acceptedByName: text("accepted_by_name").notNull(), acceptedByPosition: text("accepted_by_position").notNull(), acceptedByEmail: text("accepted_by_email").notNull(),
  authorityConfirmed: integer("authority_confirmed", { mode: "boolean" }).notNull(), recurringPaymentConfirmed: integer("recurring_payment_confirmed", { mode: "boolean" }).notNull(),
  annualCommitmentConfirmed: integer("annual_commitment_confirmed", { mode: "boolean" }).notNull().default(false), allDocumentsConfirmed: integer("all_documents_confirmed", { mode: "boolean" }).notNull(),
  ipEvidence: text("ip_evidence").notNull(), userAgent: text("user_agent").notNull(), sessionIdHash: text("session_id_hash").notNull(), language: text("language").notNull(),
  documentVersionsJson: text("document_versions_json").notNull(), documentHash: text("document_hash").notNull(), quoteFingerprint: text("quote_fingerprint").notNull(),
  companyDataConfirmed: integer("company_data_confirmed", { mode: "boolean" }).notNull().default(false), statementsJson: text("statements_json").notNull().default("{}"),
  timezone: text("timezone"), verificationSnapshotHash: text("verification_snapshot_hash"), emailVerificationMethod: text("email_verification_method"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"), invalidatedAt: text("invalidated_at"), invalidationReason: text("invalidation_reason"), acceptedAt: createdAt(),
}, (table) => [uniqueIndex("uq_contract_acceptance_revision").on(table.orderId, table.revision), index("idx_contract_acceptance_active").on(table.orderId, table.invalidatedAt)]);

export const companyVerifications = sqliteTable("company_verifications", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), marketCode: text("market_code").notNull(), adapter: text("adapter").notNull(), entityType: text("entity_type").notNull(),
  registryCountry: text("registry_country").notNull(), registryName: text("registry_name"), registrationNumber: text("registration_number"), taxNumber: text("tax_number"), regon: text("regon"),
  legalName: text("legal_name"), registeredAddress: text("registered_address"), postalCode: text("postal_code"), city: text("city"), entityTypeName: text("entity_type_name"),
  registryStatus: text("registry_status"), representationMethod: text("representation_method"), companyResult: text("company_result").notNull().default("NOT_STARTED"),
  representativeResult: text("representative_result").notNull().default("NOT_STARTED"), emailResult: text("email_result").notNull().default("NOT_STARTED"),
  overallStatus: text("overall_status").notNull().default("NOT_STARTED"), reasonCode: text("reason_code"), reasonDetail: text("reason_detail"), verificationSource: text("verification_source"),
  sourceRetrievedAt: text("source_retrieved_at"), mappedSnapshotJson: text("mapped_snapshot_json"), rawSnapshotEncrypted: text("raw_snapshot_encrypted"), rawSnapshotHash: text("raw_snapshot_hash"),
  riskFlagsJson: text("risk_flags_json").notNull().default("[]"), clientConfirmedAt: text("client_confirmed_at"), verifiedAt: text("verified_at"), manualReviewedByAdminId: text("manual_reviewed_by_admin_id"),
  manualReviewReason: text("manual_review_reason"), createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [uniqueIndex("company_verifications_order_id_unique").on(table.orderId), index("idx_company_verifications_status").on(table.overallStatus, table.updatedAt)]);

export const verificationStatusHistory = sqliteTable("verification_status_history", {
  id: text("id").primaryKey(), verificationId: text("verification_id").notNull().references(() => companyVerifications.id), fromStatus: text("from_status"), toStatus: text("to_status").notNull(),
  reasonCode: text("reason_code"), reasonDetail: text("reason_detail"), actorType: text("actor_type").notNull(), actorId: text("actor_id"), createdAt: createdAt(),
}, (table) => [index("idx_verification_history_created").on(table.verificationId, table.createdAt)]);

export const registryVerificationCache = sqliteTable("registry_verification_cache", {
  cacheKey: text("cache_key").primaryKey(), adapter: text("adapter").notNull(), mappedSnapshotJson: text("mapped_snapshot_json").notNull(), rawSnapshotEncrypted: text("raw_snapshot_encrypted").notNull(),
  rawSnapshotHash: text("raw_snapshot_hash").notNull(), verificationSource: text("verification_source").notNull(), sourceRetrievedAt: text("source_retrieved_at").notNull(), expiresAt: text("expires_at").notNull(), createdAt: createdAt(),
}, (table) => [index("idx_registry_cache_expiry").on(table.expiresAt)]);

export const emailVerificationChallenges = sqliteTable("email_verification_challenges", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), signerId: text("signer_id"), emailHash: text("email_hash").notNull(), codeHash: text("code_hash").notNull(), expiresAt: text("expires_at").notNull(),
  attemptCount: integer("attempt_count").notNull().default(0), maxAttempts: integer("max_attempts").notNull().default(5), consumedAt: text("consumed_at"), invalidatedAt: text("invalidated_at"), createdAt: createdAt(),
}, (table) => [index("idx_email_challenge_order").on(table.orderId, table.createdAt), index("idx_email_challenge_email").on(table.emailHash, table.createdAt)]);

export const verificationSigners = sqliteTable("verification_signers", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), signerRole: text("signer_role").notNull(), name: text("name").notNull(), position: text("position").notNull(),
  authorityBasis: text("authority_basis").notNull(), emailEncrypted: text("email_encrypted").notNull(), emailHash: text("email_hash").notNull(), emailVerifiedAt: text("email_verified_at"), documentHash: text("document_hash"),
  acceptedAt: text("accepted_at"), ipEvidence: text("ip_evidence"), userAgent: text("user_agent"), status: text("status").notNull().default("PENDING_EMAIL"), createdAt: createdAt(), updatedAt: updatedAt(),
  statementsJson: text("statements_json"), timezone: text("timezone"),
}, (table) => [uniqueIndex("uq_verification_signer_role").on(table.orderId, table.signerRole)]);

export const secondSignerInvites = sqliteTable("second_signer_invites", {
  id: text("id").primaryKey(), signerId: text("signer_id").notNull().references(() => verificationSigners.id), tokenHash: text("token_hash").notNull().unique(), expiresAt: text("expires_at").notNull(),
  usedAt: text("used_at"), revokedAt: text("revoked_at"), createdAt: createdAt(),
});

export const verificationDocuments = sqliteTable("verification_documents", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), kind: text("kind").notNull(), fileName: text("file_name").notNull(), contentType: text("content_type").notNull(),
  r2Key: text("r2_key").notNull().unique(), encryptionIv: text("encryption_iv").notNull(), plaintextHash: text("plaintext_hash").notNull(), byteLength: integer("byte_length").notNull(),
  status: text("status").notNull().default("PENDING_REVIEW"), retentionUntil: text("retention_until").notNull(), reviewedByAdminId: text("reviewed_by_admin_id"), reviewReason: text("review_reason"), createdAt: createdAt(),
}, (table) => [index("idx_verification_documents_order").on(table.orderId, table.createdAt)]);

export const contractDocuments = sqliteTable("contract_documents", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id),
  kind: text("kind", { enum: ["AGREEMENT", "TERMS", "DPA", "PRIVACY", "BUNDLE"] }).notNull(), contractVersionId: text("contract_version_id"),
  r2Key: text("r2_key").notNull().unique(), contentType: text("content_type").notNull(), encryptionIv: text("encryption_iv").notNull(), plaintextHash: text("plaintext_hash").notNull(),
  byteLength: integer("byte_length").notNull(), immutable: integer("immutable", { mode: "boolean" }).notNull().default(true), retentionUntil: text("retention_until").notNull(), createdAt: createdAt(),
}, (table) => [index("idx_contract_documents_order").on(table.orderId)]);

export const stripeEvents = sqliteTable("stripe_events", {
  id: text("id").primaryKey(), marketCode: text("market_code").notNull(), eventType: text("event_type").notNull(), objectId: text("object_id"), payloadHash: text("payload_hash").notNull(),
  processingStatus: text("processing_status", { enum: ["RECEIVED", "PROCESSED", "IGNORED", "FAILED"] }).notNull(), safeError: text("safe_error"),
  receivedAt: createdAt(), processedAt: text("processed_at"),
}, (table) => [index("idx_stripe_events_type_received").on(table.eventType, table.receivedAt)]);

export const provisioningJobs = sqliteTable("provisioning_jobs", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id).unique(), idempotencyKey: text("idempotency_key").notNull().unique(),
  status: text("status", { enum: ["QUEUED", "RUNNING", "WAITING_CONFIGURATION", "SUCCEEDED", "FAILED"] }).notNull(), attemptCount: integer("attempt_count").notNull().default(0),
  nextAttemptAt: text("next_attempt_at"), safeError: text("safe_error"), externalTenantId: text("external_tenant_id"), createdAt: createdAt(), updatedAt: updatedAt(),
});

export const emailNotifications = sqliteTable("email_notifications", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id),
  notificationType: text("notification_type", { enum: ["CUSTOMER_CONTRACT", "TEAM_NEW_CONTRACT"] }).notNull(), recipient: text("recipient").notNull(),
  status: text("status", { enum: ["QUEUED", "SENDING", "SENT", "FAILED"] }).notNull(), idempotencyKey: text("idempotency_key").notNull().unique(), messageId: text("message_id"),
  attemptCount: integer("attempt_count").notNull().default(0), lastAttemptAt: text("last_attempt_at"), nextAttemptAt: text("next_attempt_at"), safeError: text("safe_error"),
  createdAt: createdAt(), updatedAt: updatedAt(),
}, (table) => [index("idx_email_notifications_retry").on(table.status, table.nextAttemptAt)]);

export const deploymentStatuses = sqliteTable("deployment_statuses", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id), status: text("status").notNull(),
  expectedStartDate: text("expected_start_date"), expectedReadyDate: text("expected_ready_date"), googlePlayStatus: text("google_play_status"),
  appleAppStoreStatus: text("apple_app_store_status"), note: text("note"), changedByAdminId: text("changed_by_admin_id"), createdAt: createdAt(),
}, (table) => [index("idx_deployment_status_order_created").on(table.orderId, table.createdAt)]);

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(), email: text("email").notNull().unique(), displayName: text("display_name").notNull(), role: text("role", { enum: ["ADMIN", "SUPER_ADMIN"] }).notNull(),
  passwordAlgorithm: text("password_algorithm").notNull().default("PBKDF2-SHA256"), passwordSalt: text("password_salt").notNull(), passwordHash: text("password_hash").notNull(),
  passwordIterations: integer("password_iterations").notNull().default(600000), totpSecretEncrypted: text("totp_secret_encrypted").notNull(), mfaEnabled: integer("mfa_enabled", { mode: "boolean" }).notNull().default(true),
  sessionVersion: integer("session_version").notNull().default(1), failedLoginCount: integer("failed_login_count").notNull().default(0), lockedUntil: text("locked_until"),
  status: text("status", { enum: ["ACTIVE", "DISABLED"] }).notNull().default("ACTIVE"), lastLoginAt: text("last_login_at"), createdAt: createdAt(), updatedAt: updatedAt(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(), adminUserId: text("admin_user_id").notNull().references(() => adminUsers.id), tokenHash: text("token_hash").notNull().unique(), csrfHash: text("csrf_hash").notNull(),
  state: text("state", { enum: ["MFA_PENDING", "ACTIVE", "REVOKED"] }).notNull(), sessionVersion: integer("session_version").notNull(), ipEvidence: text("ip_evidence").notNull(),
  userAgentHash: text("user_agent_hash").notNull(), expiresAt: text("expires_at").notNull(), lastSeenAt: text("last_seen_at").notNull(), createdAt: createdAt(),
}, (table) => [index("idx_admin_sessions_user_state").on(table.adminUserId, table.state)]);

export const loginAttempts = sqliteTable("login_attempts", {
  id: text("id").primaryKey(), emailHash: text("email_hash").notNull(), ipEvidence: text("ip_evidence").notNull(),
  succeeded: integer("succeeded", { mode: "boolean" }).notNull(), reason: text("reason").notNull(), createdAt: createdAt(),
}, (table) => [index("idx_login_attempts_lookup").on(table.emailHash, table.ipEvidence, table.createdAt)]);

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(), windowStartedAt: integer("window_started_at").notNull(), count: integer("count").notNull(), blockedUntil: integer("blocked_until"), updatedAt: updatedAt(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(), actorType: text("actor_type", { enum: ["ADMIN", "SYSTEM", "PUBLIC_SESSION"] }).notNull(), actorId: text("actor_id"),
  action: text("action").notNull(), entityType: text("entity_type").notNull(), entityId: text("entity_id").notNull(), beforeHash: text("before_hash"), afterHash: text("after_hash"),
  metadataJson: text("metadata_json").notNull().default("{}"), ipEvidence: text("ip_evidence"), createdAt: createdAt(),
}, (table) => [index("idx_audit_logs_entity_created").on(table.entityType, table.entityId, table.createdAt), index("idx_audit_logs_actor_created").on(table.actorId, table.createdAt)]);

export const documentAccessLogs = sqliteTable("document_access_logs", {
  id: text("id").primaryKey(), documentId: text("document_id").notNull().references(() => contractDocuments.id),
  actorType: text("actor_type", { enum: ["ADMIN", "CUSTOMER"] }).notNull(), actorId: text("actor_id").notNull(), ipEvidence: text("ip_evidence").notNull(), createdAt: createdAt(),
}, (table) => [index("idx_document_access_document_created").on(table.documentId, table.createdAt)]);
