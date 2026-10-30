import { spawnSync } from "node:child_process";
const result = spawnSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
  encoding: "utf8",
});
if (result.status !== 0) throw new Error("Supabase local indisponível.");
const status = JSON.parse(result.stdout);
if (!status.API_URL || !(status.PUBLISHABLE_KEY || status.ANON_KEY))
  throw new Error(
    "Stack local incompleta: aguarde pnpm db:start concluir, incluindo Auth e gateway.",
  );
const response = await fetch(`${status.API_URL}/auth/v1/settings`, {
  headers: { apikey: status.PUBLISHABLE_KEY || status.ANON_KEY },
  signal: AbortSignal.timeout(10000),
});
if (!response.ok)
  throw new Error(`API Auth local respondeu ${response.status}`);
const settings = await response.json();
if (!settings.external?.email)
  throw new Error("Auth por e-mail não habilitado.");
console.log(
  "API Supabase local acessível e Auth por e-mail habilitado. Nenhum e-mail enviado.",
);
