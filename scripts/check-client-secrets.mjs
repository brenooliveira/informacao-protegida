import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
export const secretNames = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "HIBP_API_KEY",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "WAITLIST_HMAC_SECRET",
];
export function findClientLeaks(content, env) {
  const findings = [];
  for (const name of secretNames) {
    if (
      content.includes(name) ||
      (env[name] && env[name].length >= 12 && content.includes(env[name]))
    )
      findings.push(name);
  }
  if (/sb_secret_[A-Za-z0-9_-]+/.test(content))
    findings.push("SUPABASE_SECRET_KEY_PATTERN");
  for (const jwt of content.matchAll(
    /eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g,
  )) {
    try {
      if (JSON.parse(Buffer.from(jwt[1], "base64url")).role === "service_role")
        findings.push("SERVICE_ROLE_JWT");
    } catch {
      /* não é um JWT válido */
    }
  }
  return [...new Set(findings)];
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? walk(resolve(dir, entry.name))
      : [resolve(dir, entry.name)],
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    process.loadEnvFile(".env.local");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const key of Object.keys(process.env)) {
    if (
      key.startsWith("NEXT_PUBLIC_") &&
      /SERVICE_ROLE|SECRET|HIBP.*KEY|RESEND.*KEY/.test(key)
    )
      throw new Error(
        "Segredo configurado como variável pública; remova o prefixo NEXT_PUBLIC_.",
      );
  }
  const files = walk(resolve(process.env.CLIENT_BUNDLE_DIR || ".next/static"));
  if (!files.length)
    throw new Error("Bundle ausente: execute o build antes da checagem.");
  const failures = files.flatMap((file) =>
    findClientLeaks(readFileSync(file, "utf8"), process.env).map(
      (name) => `${file}: ${name}`,
    ),
  );
  if (failures.length)
    throw new Error(
      `Segredo no bundle (valores omitidos):\n${failures.join("\n")}`,
    );
  console.log(
    `Segredos: ${files.length} arquivos do cliente verificados; nenhum segredo detectado.`,
  );
}
