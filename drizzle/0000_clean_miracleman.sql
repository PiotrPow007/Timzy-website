CREATE TABLE `addon_compatible_plans` (
	`addon_id` text NOT NULL,
	`plan_id` text NOT NULL,
	PRIMARY KEY(`addon_id`, `plan_id`),
	FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `addon_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`addon_id` text NOT NULL,
	`market_id` text NOT NULL,
	`currency` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`stripe_product_id` text,
	`stripe_price_id` text,
	`version` integer NOT NULL,
	`effective_from` text NOT NULL,
	`archived_at` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_addon_price_version` ON `addon_prices` (`addon_id`,`market_id`,`version`);--> statement-breakpoint
CREATE INDEX `idx_addon_prices_catalog` ON `addon_prices` (`addon_id`,`market_id`,`status`,`effective_from`);--> statement-breakpoint
CREATE TABLE `addon_translations` (
	`addon_id` text NOT NULL,
	`language` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	PRIMARY KEY(`addon_id`, `language`),
	FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `addons` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_key` text NOT NULL,
	`payment_type` text NOT NULL,
	`standalone` integer DEFAULT false NOT NULL,
	`min_quantity` integer DEFAULT 1 NOT NULL,
	`max_quantity` integer DEFAULT 1 NOT NULL,
	`deployment_days_impact` integer DEFAULT 0 NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `addons_internal_key_unique` ON `addons` (`internal_key`);--> statement-breakpoint
CREATE INDEX `idx_addons_status_order` ON `addons` (`status`,`display_order`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`csrf_hash` text NOT NULL,
	`state` text NOT NULL,
	`session_version` integer NOT NULL,
	`ip_evidence` text NOT NULL,
	`user_agent_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_token_hash_unique` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_user_state` ON `admin_sessions` (`admin_user_id`,`state`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text NOT NULL,
	`password_algorithm` text DEFAULT 'PBKDF2-SHA256' NOT NULL,
	`password_salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_iterations` integer DEFAULT 600000 NOT NULL,
	`totp_secret_encrypted` text NOT NULL,
	`mfa_enabled` integer DEFAULT true NOT NULL,
	`session_version` integer DEFAULT 1 NOT NULL,
	`failed_login_count` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before_hash` text,
	`after_hash` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`ip_evidence` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_entity_created` ON `audit_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_actor_created` ON `audit_logs` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `contract_acceptances` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`revision` integer NOT NULL,
	`accepted_by_name` text NOT NULL,
	`accepted_by_position` text NOT NULL,
	`accepted_by_email` text NOT NULL,
	`authority_confirmed` integer NOT NULL,
	`recurring_payment_confirmed` integer NOT NULL,
	`annual_commitment_confirmed` integer DEFAULT false NOT NULL,
	`all_documents_confirmed` integer NOT NULL,
	`ip_evidence` text NOT NULL,
	`user_agent` text NOT NULL,
	`session_id_hash` text NOT NULL,
	`language` text NOT NULL,
	`document_versions_json` text NOT NULL,
	`document_hash` text NOT NULL,
	`quote_fingerprint` text NOT NULL,
	`stripe_checkout_session_id` text,
	`invalidated_at` text,
	`invalidation_reason` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_contract_acceptance_revision` ON `contract_acceptances` (`order_id`,`revision`);--> statement-breakpoint
CREATE INDEX `idx_contract_acceptance_active` ON `contract_acceptances` (`order_id`,`invalidated_at`);--> statement-breakpoint
CREATE TABLE `contract_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`kind` text NOT NULL,
	`contract_version_id` text,
	`r2_key` text NOT NULL,
	`content_type` text NOT NULL,
	`encryption_iv` text NOT NULL,
	`plaintext_hash` text NOT NULL,
	`byte_length` integer NOT NULL,
	`immutable` integer DEFAULT true NOT NULL,
	`retention_until` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contract_documents_r2_key_unique` ON `contract_documents` (`r2_key`);--> statement-breakpoint
CREATE INDEX `idx_contract_documents_order` ON `contract_documents` (`order_id`);--> statement-breakpoint
CREATE TABLE `contract_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`market_code` text NOT NULL,
	`language` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_contract_template_scope` ON `contract_templates` (`kind`,`market_code`,`language`);--> statement-breakpoint
CREATE TABLE `contract_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`version` integer NOT NULL,
	`content_json` text NOT NULL,
	`content_hash` text NOT NULL,
	`effective_from` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`legal_approval_reference` text,
	`published_by_admin_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `contract_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_contract_version` ON `contract_versions` (`template_id`,`version`);--> statement-breakpoint
CREATE INDEX `idx_contract_versions_active` ON `contract_versions` (`template_id`,`status`,`effective_from`);--> statement-breakpoint
CREATE TABLE `deployment_statuses` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`status` text NOT NULL,
	`expected_start_date` text,
	`expected_ready_date` text,
	`google_play_status` text,
	`apple_app_store_status` text,
	`note` text,
	`changed_by_admin_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_deployment_status_order_created` ON `deployment_statuses` (`order_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `document_access_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text NOT NULL,
	`ip_evidence` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `contract_documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_document_access_document_created` ON `document_access_logs` (`document_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `email_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`notification_type` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`message_id` text,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`last_attempt_at` text,
	`next_attempt_at` text,
	`safe_error` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_notifications_idempotency_key_unique` ON `email_notifications` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `idx_email_notifications_retry` ON `email_notifications` (`status`,`next_attempt_at`);--> statement-breakpoint
CREATE TABLE `legal_entities` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`legal_name` text NOT NULL,
	`company_number` text,
	`tax_id` text,
	`registry_number` text,
	`regon` text,
	`address_line_1` text NOT NULL,
	`postal_code` text,
	`city` text NOT NULL,
	`country_code` text NOT NULL,
	`technology_provider` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `legal_entities_code_unique` ON `legal_entities` (`code`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`email_hash` text NOT NULL,
	`ip_evidence` text NOT NULL,
	`succeeded` integer NOT NULL,
	`reason` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_login_attempts_lookup` ON `login_attempts` (`email_hash`,`ip_evidence`,`created_at`);--> statement-breakpoint
CREATE TABLE `markets` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`currency` text NOT NULL,
	`seller_id` text NOT NULL,
	`technology_provider_id` text NOT NULL,
	`activation_fee_open_minor` integer NOT NULL,
	`activation_fee_annual_minor` integer DEFAULT 0 NOT NULL,
	`billing_countries_json` text NOT NULL,
	`stripe_account_key` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`seller_id`) REFERENCES `legal_entities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`technology_provider_id`) REFERENCES `legal_entities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `markets_code_unique` ON `markets` (`code`);--> statement-breakpoint
CREATE TABLE `order_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`revision` integer NOT NULL,
	`changed_fields_json` text NOT NULL,
	`previous_fingerprint` text,
	`next_fingerprint` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_order_change_revision` ON `order_changes` (`order_id`,`revision`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`item_type` text NOT NULL,
	`catalog_item_id` text,
	`price_version_id` text,
	`payment_type` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_amount_minor` integer NOT NULL,
	`total_amount_minor` integer NOT NULL,
	`stripe_price_id` text,
	`snapshot_json` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_price_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`snapshot_hash` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_price_snapshots_order_id_unique` ON `order_price_snapshots` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`public_token_hash` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`market_code` text,
	`language` text,
	`currency` text,
	`contract_term` text,
	`registration_country` text,
	`billing_country` text,
	`selection_json` text DEFAULT '{}' NOT NULL,
	`client_data_encrypted` text,
	`client_data_hash` text,
	`immutable_snapshot_json` text,
	`quote_fingerprint` text,
	`monthly_net_minor` integer,
	`one_time_net_minor` integer,
	`activation_fee_minor` integer,
	`estimated_tax_minor` integer,
	`due_today_minor` integer,
	`deployment_days` integer,
	`acceptance_revision` integer DEFAULT 0 NOT NULL,
	`stripe_customer_id` text,
	`stripe_checkout_session_id` text,
	`stripe_subscription_id` text,
	`stripe_invoice_id` text,
	`stripe_payment_intent_id` text,
	`paid_at` text,
	`expires_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripe_checkout_session_id_unique` ON `orders` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE INDEX `idx_orders_status_created` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_customer_email_hash` ON `orders` (`client_data_hash`);--> statement-breakpoint
CREATE TABLE `plan_included_addons` (
	`plan_id` text NOT NULL,
	`addon_id` text NOT NULL,
	PRIMARY KEY(`plan_id`, `addon_id`),
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`addon_id`) REFERENCES `addons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`market_id` text NOT NULL,
	`currency` text NOT NULL,
	`payment_type` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`stripe_product_id` text,
	`stripe_price_id` text,
	`version` integer NOT NULL,
	`effective_from` text NOT NULL,
	`archived_at` text,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_plan_price_version` ON `plan_prices` (`plan_id`,`market_id`,`payment_type`,`version`);--> statement-breakpoint
CREATE INDEX `idx_plan_prices_catalog` ON `plan_prices` (`plan_id`,`market_id`,`status`,`effective_from`);--> statement-breakpoint
CREATE TABLE `plan_translations` (
	`plan_id` text NOT NULL,
	`language` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`benefits_json` text DEFAULT '[]' NOT NULL,
	PRIMARY KEY(`plan_id`, `language`),
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_key` text NOT NULL,
	`included_features_json` text DEFAULT '[]' NOT NULL,
	`recommended` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`deployment_days` integer DEFAULT 7 NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plans_internal_key_unique` ON `plans` (`internal_key`);--> statement-breakpoint
CREATE INDEX `idx_plans_status_order` ON `plans` (`status`,`display_order`);--> statement-breakpoint
CREATE TABLE `provisioning_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`status` text NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`next_attempt_at` text,
	`safe_error` text,
	`external_tenant_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `provisioning_jobs_order_id_unique` ON `provisioning_jobs` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `provisioning_jobs_idempotency_key_unique` ON `provisioning_jobs` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_started_at` integer NOT NULL,
	`count` integer NOT NULL,
	`blocked_until` integer,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stripe_events` (
	`id` text PRIMARY KEY NOT NULL,
	`market_code` text NOT NULL,
	`event_type` text NOT NULL,
	`object_id` text,
	`payload_hash` text NOT NULL,
	`processing_status` text NOT NULL,
	`safe_error` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`processed_at` text
);
--> statement-breakpoint
CREATE INDEX `idx_stripe_events_type_received` ON `stripe_events` (`event_type`,`created_at`);