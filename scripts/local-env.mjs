import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
const result = spawnSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
  encoding: "utf8",
  maxBuffer: 2 * 1024 * 1024,
});
if (result.status !== 0)
  throw new Error("Supabase indisponível. Execute pnpm db:start.");
const status = JSON.parse(result.stdout);
const key = status.PUBLISHABLE_KEY || status.ANON_KEY;
if (
  !key ||
  !status.API_URL ||
  !new URL(status.API_URL).hostname.match(/^(127\.0\.0\.1|localhost)$/)
)
  throw new Error("Chaves locais válidas não encontradas.");
let env = readFileSync(
  existsSync(".env.local") ? ".env.local" : ".env.example",
  "utf8",
);
const values = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY || status.SECRET_KEY,
  WAITLIST_HMAC_SECRET:
    env.match(/^WAITLIST_HMAC_SECRET=(.+)$/m)?.[1] ||
    randomBytes(32).toString("hex"),
};
if (!values.SUPABASE_SERVICE_ROLE_KEY)
  throw new Error("Chave de serviço local ausente.");
for (const [name, value] of Object.entries(values)) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  env = pattern.test(env)
    ? env.replace(pattern, `${name}=${value}`)
    : env + `\n${name}=${value}\n`;
}
if (process.env.GITHUB_ACTIONS && process.env.GITHUB_ENV) {
  for (const [name, value] of Object.entries(values)) {
    if (!name.startsWith("NEXT_PUBLIC_")) console.log(`::add-mask::${value}`);
    appendFileSync(process.env.GITHUB_ENV, `${name}=${value}\n`);
  }
}
writeFileSync(".env.local", env, { mode: 0o600 });
chmodSync(".env.local", 0o600);
console.log(
  ".env.local atualizado com as chaves reais locais e segredo HMAC (somente servidor); valores omitidos.",
);
