import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// SSR com nonce e sem ISR: não provisionar R2/D1/filas para este deploy.
export default defineCloudflareConfig();
