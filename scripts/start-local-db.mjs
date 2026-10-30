import { spawnSync } from "node:child_process";
const network = "informacao-protegida-local";
const existing = spawnSync("docker", ["network", "inspect", network], {
  stdio: "ignore",
});
if (existing.status !== 0) {
  const created = spawnSync(
    "docker",
    [
      "network",
      "create",
      "-o",
      "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
      network,
    ],
    { stdio: "ignore" },
  );
  if (created.status !== 0)
    throw new Error(
      "Docker indisponível: inicie o Docker Desktop antes de pnpm db:start.",
    );
}
const result = spawnSync(
  "pnpm",
  [
    "exec",
    "supabase",
    "start",
    "--network-id",
    network,
    "--exclude",
    "studio,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor",
  ],
  { stdio: ["inherit", "ignore", "inherit"] },
);
if (result.status !== 0) process.exit(result.status || 1);
console.log(
  "Supabase local iniciado. Execute pnpm db:env; API em http://127.0.0.1:54321; SMTP local em http://127.0.0.1:54324.",
);
