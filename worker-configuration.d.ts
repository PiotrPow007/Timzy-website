/// <reference types="@cloudflare/workers-types" />

declare module "cloudflare:workers" {
  export const env: import("./lib/server/env").TimzyEnv;
}
