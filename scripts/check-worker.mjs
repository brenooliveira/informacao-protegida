import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";
import { chromium } from "@playwright/test";
const origin = "http://127.0.0.1:8788";
const variables = {
  APP_ENV: "production",
  NEXT_PUBLIC_APP_URL: "https://informacao-protegida.breno26.workers.dev",
  WAITLIST_ENABLED: "false",
  BREACH_PROVIDER: "disabled",
  DEPLOYMENT_PLATFORM: "cloudflare",
};
const child = spawn(
  "pnpm",
  [
    "cf:preview",
    "--",
    "--ip",
    "127.0.0.1",
    "--port",
    "8788",
    ...Object.entries(variables).flatMap(([key, value]) => [
      "--var",
      `${key}:${value}`,
    ]),
  ],
  { detached: true, stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
child.stdout.on("data", (data) => {
  logs = (logs + data).slice(-12000);
});
child.stderr.on("data", (data) => {
  logs = (logs + data).slice(-12000);
});
let browser;
try {
  let home;
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null)
      throw new Error("Preview encerrou antes de iniciar.");
    try {
      home = await fetch(origin, { signal: AbortSignal.timeout(2000) });
      if (home.ok) break;
    } catch {
      /* Aguarda somente o servidor local. */
    }
    await setTimeout(500);
  }
  assert.equal(home?.status, 200, "SSR deve responder 200 no workerd");
  const csp = home.headers.get("content-security-policy");
  const nonce = csp?.match(/'nonce-([^']+)'/)?.[1];
  assert.ok(nonce, "CSP deve conter nonce");
  assert.match(await home.text(), new RegExp(`nonce="${nonce}"`));
  assert.equal(home.headers.get("cache-control"), "private, no-store");
  assert.match(
    home.headers.get("strict-transport-security"),
    /max-age=31536000/,
  );
  const next = await fetch(origin);
  assert.notEqual(
    next.headers.get("content-security-policy"),
    csp,
    "nonce deve mudar por resposta",
  );
  for (const path of [
    "/privacidade",
    "/termos",
    "/projeto",
    "/lista-de-espera/cancelar",
    "/robots.txt",
    "/sitemap.xml",
  ]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
  }
  for (const path of ["/api/waitlist", "/api/waitlist/unsubscribe"]) {
    const response = await fetch(origin + path, { method: "POST", body: "{}" });
    assert.equal(response.status, 503, "lista desativada não coleta dados");
  }
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin, { waitUntil: "networkidle" });
  assert.ok(
    await page
      .getByRole("heading", { name: "Inscrições em breve." })
      .isVisible(),
  );
  assert.equal(await page.getByLabel("Seu e-mail", { exact: true }).count(), 0);
  await page.route("https://api.pwnedpasswords.com/range/*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: "1E4C9B93F3F0682250B6CF8331B7EE68FD8:123456\r\n",
    }),
  );
  await page
    .getByLabel("Senha para verificar", { exact: true })
    .fill("password");
  await page
    .getByRole("button", { name: "Verificar senha", exact: true })
    .click();
  await page
    .getByText("Esta senha apareceu em vazamentos conhecidos.", { exact: true })
    .waitFor();
  assert.equal(
    await page.getByLabel("Senha para verificar", { exact: true }).inputValue(),
    "",
  );
  assert.deepEqual(errors, [], "hidratação deve ocorrer sem erros");
  console.log(
    "Workers: SSR, nonce/CSP, rotas, APIs desativadas e verificador no Chromium aprovados.",
  );
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  await browser?.close();
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    /* Já encerrado. */
  }
}
