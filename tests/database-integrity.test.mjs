import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const directory = mkdtempSync(join(tmpdir(), "timzy-db-test-"));
const database = join(directory, "timzy.sqlite");
for (const migration of ["0000_clean_miracleman.sql", "0001_timzy_catalog_seed.sql", "0002_naive_turbo.sql", "0003_striped_absorbing_man.sql", "0004_steep_morph.sql", "0005_update_pl_activation_fee.sql", "0006_configure_basic_plan.sql", "0007_company_verification.sql"]) {
  execFileSync("sqlite3", [database], { input: readFileSync(new URL(`../drizzle/${migration}`, import.meta.url), "utf8") });
}
const sql = (statement) => execFileSync("sqlite3", [database, statement], { encoding: "utf8" }).trim();

test("all migrations apply with valid catalogue seed and database integrity", () => {
  assert.equal(sql("PRAGMA integrity_check;"), "ok"); assert.equal(sql("SELECT COUNT(*) FROM addons;"), "15"); assert.equal(sql("SELECT COUNT(*) FROM contract_versions;"), "24");
  assert.equal(sql("SELECT activation_fee_open_minor FROM markets WHERE code='PL';"), "39900"); assert.equal(sql("SELECT default_deployment_days FROM markets WHERE code='PL';"), "7");
  assert.equal(sql("SELECT group_concat(currency||':'||amount_minor,',') FROM (SELECT currency,amount_minor FROM plan_prices ORDER BY currency);"), "EUR:3900,PLN:12900");
  assert.equal(sql("SELECT COUNT(*) FROM plan_prices WHERE status='DRAFT' AND stripe_price_id IS NULL;"), "2"); assert.equal(sql("SELECT COUNT(*) FROM plan_translations WHERE name='Basic';"), "3");
  assert.equal(sql("SELECT COUNT(*) FROM pragma_table_info('orders') WHERE name IN ('final_tax_minor','final_total_minor');"), "2");
  assert.equal(sql("SELECT COUNT(*) FROM pragma_table_info('orders') WHERE name IN ('verification_status','company_verification_id');"), "2");
  assert.equal(sql("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name IN ('company_verifications','verification_status_history','registry_verification_cache','email_verification_challenges','verification_signers','second_signer_invites','verification_documents');"), "7");
});

test("idempotency constraints prevent duplicate Stripe, notification and provisioning records", () => {
  sql("INSERT INTO orders(id,order_number,public_token_hash) VALUES('order-test','TZ-TEST','hash');");
  sql("INSERT OR IGNORE INTO stripe_events(id,market_code,event_type,payload_hash,processing_status) VALUES('evt-1','PL','invoice.paid','hash','PROCESSED'); INSERT OR IGNORE INTO stripe_events(id,market_code,event_type,payload_hash,processing_status) VALUES('evt-1','PL','invoice.paid','hash','PROCESSED');");
  sql("INSERT OR IGNORE INTO email_notifications(id,order_id,notification_type,recipient,status,idempotency_key) VALUES('email-1','order-test','TEAM_NEW_CONTRACT','hello@timzy.app','QUEUED','team:order-test'); INSERT OR IGNORE INTO email_notifications(id,order_id,notification_type,recipient,status,idempotency_key) VALUES('email-2','order-test','TEAM_NEW_CONTRACT','hello@timzy.app','QUEUED','team:order-test');");
  sql("INSERT OR IGNORE INTO provisioning_jobs(id,order_id,idempotency_key,status) VALUES('job-1','order-test','provision:order-test','QUEUED'); INSERT OR IGNORE INTO provisioning_jobs(id,order_id,idempotency_key,status) VALUES('job-2','order-test','provision:order-test','QUEUED');");
  assert.equal(sql("SELECT (SELECT COUNT(*) FROM stripe_events WHERE id='evt-1')||(SELECT COUNT(*) FROM email_notifications WHERE idempotency_key='team:order-test')||(SELECT COUNT(*) FROM provisioning_jobs WHERE order_id='order-test');"), "111");
  assert.equal(sql("UPDATE email_notifications SET status='SENDING' WHERE id='email-1' AND status IN ('QUEUED','FAILED'); SELECT changes();"), "1");
  assert.equal(sql("UPDATE email_notifications SET status='SENDING' WHERE id='email-1' AND status IN ('QUEUED','FAILED'); SELECT changes();"), "0");
  assert.equal(sql("UPDATE provisioning_jobs SET status='RUNNING' WHERE id='job-1' AND status IN ('QUEUED','FAILED'); SELECT changes();"), "1");
  assert.equal(sql("UPDATE provisioning_jobs SET status='RUNNING' WHERE id='job-1' AND status IN ('QUEUED','FAILED'); SELECT changes();"), "0");
});

test("historical price versions cannot collide within the same scope", () => {
  sql("INSERT INTO plan_prices(id,plan_id,market_id,currency,payment_type,amount_minor,version,effective_from,status) VALUES('price-1','plan_timzy_core','market_pl','PLN','MONTHLY',10000,2,'2026-01-01','ARCHIVED');");
  const collision = spawnSync("sqlite3", [database, "INSERT INTO plan_prices(id,plan_id,market_id,currency,payment_type,amount_minor,version,effective_from,status) VALUES('price-2','plan_timzy_core','market_pl','PLN','MONTHLY',12000,2,'2026-02-01','ACTIVE');"]);
  assert.notEqual(collision.status, 0);
  sql("INSERT INTO plan_prices(id,plan_id,market_id,currency,payment_type,amount_minor,version,effective_from,status) VALUES('price-2','plan_timzy_core','market_pl','PLN','MONTHLY',12000,3,'2026-02-01','ACTIVE');");
  assert.equal(sql("SELECT group_concat(amount_minor,',') FROM (SELECT amount_minor FROM plan_prices WHERE market_id='market_pl' ORDER BY version);"), "12900,10000,12000");
});
