import { format, resolveConfig } from "prettier";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const result = spawnSync(
  "pnpm",
  [
    "exec",
    "supabase",
    "gen",
    "types",
    "typescript",
    "--local",
    "--schema",
    "public",
  ],
  { encoding: "utf8", maxBuffer: 5 * 1024 * 1024 },
);
if (result.status !== 0 || !result.stdout.includes("export type Database"))
  throw new Error(
    "Geração falhou; inicie o Supabase local. Tipos existentes preservados.",
  );
const outputPath = "src/infrastructure/supabase/database.types.ts";
writeFileSync(
  outputPath,
  await format(result.stdout, {
    ...(await resolveConfig(outputPath)),
    parser: "typescript",
  }),
);
console.log("Tipos gerados do banco local, sem edição manual.");
