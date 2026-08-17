ALTER TABLE `orders` ADD `verification_status` text DEFAULT 'NOT_STARTED' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `company_verification_id` text;
--> statement-breakpoint
ALTER TABLE `contract_acceptances` ADD `company_data_confirmed` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `contract_acceptances` ADD `statements_json` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE `contract_acceptances` ADD `timezone` text;
--> statement-breakpoint
ALTER TABLE `contract_acceptances` ADD `verification_snapshot_hash` text;
--> statement-breakpoint
ALTER TABLE `contract_acceptances` ADD `email_verification_method` text;
--> statement-breakpoint
CREATE TABLE `company_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`market_code` text NOT NULL,
	`adapter` text NOT NULL,
	`entity_type` text NOT NULL,
	`registry_country` text NOT NULL,
	`registry_name` text,
	`registration_number` text,
	`tax_number` text,
	`regon` text,
	`legal_name` text,
	`registered_address` text,
	`postal_code` text,
	`city` text,
	`entity_type_name` text,
	`registry_status` text,
	`representation_method` text,
	`company_result` text DEFAULT 'NOT_STARTED' NOT NULL,
	`representative_result` text DEFAULT 'NOT_STARTED' NOT NULL,
	`email_result` text DEFAULT 'NOT_STARTED' NOT NULL,
	`overall_status` text DEFAULT 'NOT_STARTED' NOT NULL,
	`reason_code` text,
	`reason_detail` text,
	`verification_source` text,
	`source_retrieved_at` text,
	`mapped_snapshot_json` text,
	`raw_snapshot_encrypted` text,
	`raw_snapshot_hash` text,
	`risk_flags_json` text DEFAULT '[]' NOT NULL,
	`client_confirmed_at` text,
	`verified_at` text,
	`manual_reviewed_by_admin_id` text,
	`manual_review_reason` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `company_verifications_order_id_unique` ON `company_verifications` (`order_id`);
--> statement-breakpoint
CREATE INDEX `idx_company_verifications_status` ON `company_verifications` (`overall_status`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `verification_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`verification_id` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`reason_code` text,
	`reason_detail` text,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`verification_id`) REFERENCES `company_verifications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_verification_history_created` ON `verification_status_history` (`verification_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `registry_verification_cache` (
	`cache_key` text PRIMARY KEY NOT NULL,
	`adapter` text NOT NULL,
	`mapped_snapshot_json` text NOT NULL,
	`raw_snapshot_encrypted` text NOT NULL,
	`raw_snapshot_hash` text NOT NULL,
	`verification_source` text NOT NULL,
	`source_retrieved_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_registry_cache_expiry` ON `registry_verification_cache` (`expires_at`);
--> statement-breakpoint
CREATE TABLE `email_verification_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`signer_id` text,
	`email_hash` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 5 NOT NULL,
	`consumed_at` text,
	`invalidated_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`signer_id`) REFERENCES `verification_signers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_email_challenge_order` ON `email_verification_challenges` (`order_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_email_challenge_email` ON `email_verification_challenges` (`email_hash`,`created_at`);
--> statement-breakpoint
CREATE TABLE `verification_signers` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`signer_role` text NOT NULL,
	`name` text NOT NULL,
	`position` text NOT NULL,
	`authority_basis` text NOT NULL,
	`email_encrypted` text NOT NULL,
	`email_hash` text NOT NULL,
	`email_verified_at` text,
	`document_hash` text,
	`accepted_at` text,
	`ip_evidence` text,
	`user_agent` text,
	`statements_json` text,
	`timezone` text,
	`status` text DEFAULT 'PENDING_EMAIL' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_verification_signer_role` ON `verification_signers` (`order_id`,`signer_role`);
--> statement-breakpoint
CREATE TABLE `second_signer_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`signer_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`used_at` text,
	`revoked_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`signer_id`) REFERENCES `verification_signers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `second_signer_invites_token_hash_unique` ON `second_signer_invites` (`token_hash`);
--> statement-breakpoint
CREATE TABLE `verification_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`kind` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`encryption_iv` text NOT NULL,
	`plaintext_hash` text NOT NULL,
	`byte_length` integer NOT NULL,
	`status` text DEFAULT 'PENDING_REVIEW' NOT NULL,
	`retention_until` text NOT NULL,
	`reviewed_by_admin_id` text,
	`review_reason` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verification_documents_r2_key_unique` ON `verification_documents` (`r2_key`);
--> statement-breakpoint
CREATE INDEX `idx_verification_documents_order` ON `verification_documents` (`order_id`,`created_at`);
