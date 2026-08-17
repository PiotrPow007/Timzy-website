export interface TimzyEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  DOCUMENTS: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): { output(options: { format: string; quality: number }): Promise<{ response(): Response }> };
    };
  };
  APP_BASE_URL?: string;
  APP_ENV?: string;
  ADMIN_MFA_REQUIRED?: string;
  DATA_ENCRYPTION_KEY?: string;
  SESSION_SECRET?: string;
  CAPTCHA_SECRET?: string;
  STRIPE_PL_SECRET_KEY?: string;
  STRIPE_PL_WEBHOOK_SECRET?: string;
  STRIPE_INTERNATIONAL_SECRET_KEY?: string;
  STRIPE_INTERNATIONAL_WEBHOOK_SECRET?: string;
  STRIPE_TEST_WEBHOOK_SECRET?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USERNAME?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM?: string;
  CONTACT_TO?: string;
  NEW_CONTRACT_NOTIFICATION_EMAIL?: string;
  PROVISIONING_WEBHOOK_URL?: string;
  PROVISIONING_WEBHOOK_SECRET?: string;
}

export interface TimzyExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export function requireSecret(env: TimzyEnv, key: "DATA_ENCRYPTION_KEY" | "SESSION_SECRET"): string {
  const value = env[key];
  if (!value || value.length < 32) throw new Error(`${key} is not configured`);
  return value;
}
