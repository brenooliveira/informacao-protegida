import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
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
for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
})) {
  env = env.replace(new RegExp(`^${name}=.*$`, "m"), `${name}=${value}`);
}
writeFileSync(".env.local", env, { mode: 0o600 });
chmodSync(".env.local", 0o600);
console.log(
  ".env.local atualizado com as chaves públicas reais da stack local; valores omitidos.",
);
