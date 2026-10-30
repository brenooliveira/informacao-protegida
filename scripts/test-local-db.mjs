import { readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const config = readFileSync("supabase/config.toml", "utf8");
const projectId = config.match(/^project_id\s*=\s*"([a-zA-Z0-9_-]+)"/m)?.[1];
if (!projectId) throw new Error("project_id local inválido.");
const files = readdirSync("supabase/tests")
  .filter((file) => file.endsWith(".sql"))
  .sort();
if (!files.length) throw new Error("Nenhum teste SQL encontrado.");
for (const file of files) {
  // stdin evita bind mount da pasta Documents, que travou o runner pg_prove no macOS.
  const sql =
    "create extension if not exists pgtap with schema extensions; set search_path = public, extensions;\n" +
    readFileSync(`supabase/tests/${file}`, "utf8");
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      `supabase_db_${projectId}`,
      "psql",
      "-X",
      "-q",
      "-A",
      "-t",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      "postgres",
    ],
    { input: sql, encoding: "utf8", timeout: 30000 },
  );
  const output = result.stdout || "";
  const planned = Number(output.match(/^1\.\.(\d+)$/m)?.[1]);
  const passed = [...output.matchAll(/^ok \d+\b/gm)].length;
  if (
    result.status !== 0 ||
    /^not ok|^Bail out!/m.test(output) ||
    !planned ||
    passed !== planned
  ) {
    console.error(output);
    throw new Error(
      `Teste SQL falhou: ${file}. Verifique Docker/SQL/RLS; não há dados pessoais nos asserts.`,
    );
  }
  console.log(`${file}: ${passed}/${planned} verificações passaram.`);
}
