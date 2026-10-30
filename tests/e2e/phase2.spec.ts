import { expect, test } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const fingerprint = (value: string) =>
  createHash("sha1").update(value, "utf8").digest("hex").toUpperCase();

test("consulta somente por clique e só envia o prefixo de cinco caracteres", async ({
  page,
}, testInfo) => {
  const hash = fingerprint("password");
  const calls: string[] = [];
  const leaks: string[] = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).hostname === "localhost" &&
      ((request.postData() || "").includes("password") ||
        new URL(request.url()).search.includes(hash))
    )
      leaks.push(request.url());
  });
  await page.route("https://api.pwnedpasswords.com/range/*", async (route) => {
    const req = route.request();
    calls.push(req.url());
    expect(new URL(req.url()).pathname).toBe("/range/" + hash.slice(0, 5));
    expect(req.postData()).toBeNull();
    expect(req.headers()["add-padding"]).toBe("true");
    expect(req.headers()["cookie"]).toBeUndefined();
    await route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: hash.slice(5) + ":123456\r\n" + "0".repeat(35) + ":0",
    });
  });
  await page.goto("/");
  await page
    .getByLabel("Senha para verificar", { exact: true })
    .fill("password");
  await page
    .getByRole("heading", { name: "Essa senha já apareceu em um vazamento?" })
    .click();
  expect(calls).toEqual([]);
  await page
    .getByRole("button", { name: "Verificar senha", exact: true })
    .click();
  await expect(
    page.getByText("Esta senha apareceu em vazamentos conhecidos.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Senha para verificar", { exact: true }),
  ).toHaveValue("");
  expect(calls).toHaveLength(1);
  expect(leaks).toEqual([]);
  await page
    .locator("#verificador")
    .screenshot({ path: testInfo.outputPath("verificador.png") });
});

test("senha aleatória ausente não é apresentada como garantia de segurança", async ({
  page,
}) => {
  const value = randomUUID() + randomUUID();
  const hash = fingerprint(value);
  await page.route("https://api.pwnedpasswords.com/range/*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/plain",
      body:
        hash.slice(5) +
        ":0\r\n" +
        (hash[5] === "A" ? "B" : "A") +
        hash.slice(6) +
        ":42",
    }),
  );
  await page.goto("/");
  await page.getByLabel("Senha para verificar", { exact: true }).fill(value);
  await page
    .getByRole("button", { name: "Verificar senha", exact: true })
    .click();
  await expect(
    page.getByText("Nenhum registro encontrado para esta senha.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Isso não garante que a senha seja segura/),
  ).toBeVisible();
  await expect(
    page.getByLabel("Senha para verificar", { exact: true }),
  ).toHaveValue("");
});

test("indisponibilidade não vira senha segura e limpa o campo", async ({
  page,
}) => {
  await page.route("https://api.pwnedpasswords.com/range/*", (route) =>
    route.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/");
  await page
    .getByLabel("Senha para verificar", { exact: true })
    .fill("example-for-error-test");
  await page
    .getByRole("button", { name: "Verificar senha", exact: true })
    .click();
  await expect(page.getByText(/Nenhum resultado foi concluído/)).toBeVisible();
  await expect(
    page.getByLabel("Senha para verificar", { exact: true }),
  ).toHaveValue("");
});

test("lista real exige consentimento, registra uma vez e permite revogar", async ({
  page,
  request,
}) => {
  const email = "fase2-e2e-" + randomUUID() + "@example.invalid";
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  try {
    await page.goto("/");
    await page.getByLabel("Seu e-mail", { exact: true }).fill(email);
    await page
      .getByRole("button", { name: "Entrar na lista de espera", exact: true })
      .click();
    await expect(
      page.getByText("Marque o consentimento para entrar na lista."),
    ).toBeVisible();
    await page.getByRole("checkbox").check();
    await page
      .getByRole("button", { name: "Entrar na lista de espera", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Pedido recebido." }),
    ).toBeVisible();
    const { data, error } = await db
      .from("waitlist")
      .select("id")
      .eq("normalized_email", email);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    const consent = await db
      .from("consent_records")
      .select("text_version,ip_truncated")
      .eq("waitlist_id", data![0].id);
    expect(consent.error).toBeNull();
    expect(consent.data).toHaveLength(1);
    expect(consent.data![0].text_version).toBe("waitlist-v1-2026-10-30");
    expect(consent.data![0].ip_truncated).toBe("127.0.0.0/24");
    const href = await page
      .getByRole("link", { name: "Abrir link de cancelamento" })
      .getAttribute("href");
    expect(href).toMatch(/^\/lista-de-espera\/cancelar#[A-Za-z0-9_-]{43}$/);
    const repeated = await request.post("/api/waitlist", {
      headers: { origin: "http://localhost:3100" },
      data: { email, consent: true },
    });
    expect(repeated.status()).toBe(200);
    await page
      .getByRole("link", { name: "Abrir link de cancelamento" })
      .click();
    await page
      .getByRole("button", { name: "Cancelar minha inscrição", exact: true })
      .click();
    await expect(
      page.getByText(
        "Se o link era válido, a inscrição e seus dados foram removidos.",
      ),
    ).toBeVisible();
    const removed = await db
      .from("waitlist")
      .select("id")
      .eq("normalized_email", email);
    expect(removed.data).toEqual([]);
    const removedConsent = await db
      .from("consent_records")
      .select("id")
      .eq("waitlist_id", data![0].id);
    expect(removedConsent.data).toEqual([]);
  } finally {
    await db.from("waitlist").delete().eq("normalized_email", email);
  }
});

test("endpoints recusam consentimento falso, origem externa e payload excessivo", async ({
  request,
}) => {
  for (const data of [
    { email: "fase2-invalid@example.invalid", consent: false },
    { email: "invalid", consent: true },
  ])
    expect(
      (
        await request.post("/api/waitlist", {
          headers: { origin: "http://localhost:3100" },
          data,
        })
      ).status(),
    ).toBe(400);
  expect(
    (
      await request.post("/api/waitlist", {
        headers: { origin: "https://evil.invalid" },
        data: { email: "fase2-cross@example.invalid", consent: true },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/waitlist", {
        headers: { origin: "http://localhost:3100" },
        data: { email: "x".repeat(5000), consent: true },
      })
    ).status(),
  ).toBe(400);
});

test("páginas legais, atribuição e SEO existem", async ({ page, request }) => {
  await page.goto("/privacidade");
  await expect(
    page.getByRole("heading", { name: "Política de Privacidade." }),
  ).toBeVisible();
  await expect(
    page.getByText(/RASCUNHO \[REVISAR COM ADVOGADO\]/),
  ).toBeVisible();
  await page.goto("/termos");
  await expect(
    page.getByRole("heading", { name: "Termos de Uso." }),
  ).toBeVisible();
  expect((await request.get("/robots.txt")).status()).toBe(200);
  expect((await request.get("/sitemap.xml")).status()).toBe(200);
  const image = await request.get("/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
});

for (const kind of ["known", "random"] as const) {
  test(`integração real Pwned Passwords: ${kind}`, async ({
    page,
  }, testInfo) => {
    test.skip(
      process.env.LIVE_PASSWORD_CHECK !== "1",
      "Ativar explicitamente para consultar a API pública com dados de teste.",
    );
    test.skip(
      test.info().project.name !== "desktop",
      "Uma execução real por cenário é suficiente.",
    );
    const value = kind === "known" ? "password" : randomUUID() + randomUUID();
    const hash = fingerprint(value);
    const calls: string[] = [];
    page.on("request", (req) => {
      if (new URL(req.url()).hostname === "api.pwnedpasswords.com")
        calls.push(req.url());
    });
    await page.goto("/");
    await page.getByLabel("Senha para verificar", { exact: true }).fill(value);
    await page
      .getByRole("button", { name: "Verificar senha", exact: true })
      .click();
    await expect(
      page.getByText(
        kind === "known"
          ? "Esta senha apareceu em vazamentos conhecidos."
          : "Nenhum registro encontrado para esta senha.",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 20000 });
    expect(calls).toEqual([
      "https://api.pwnedpasswords.com/range/" + hash.slice(0, 5),
    ]);
    await page.locator("#verificador").screenshot({
      path: testInfo.outputPath(`verificador-${kind}-real.png`),
    });
    await expect(
      page.getByLabel("Senha para verificar", { exact: true }),
    ).toHaveValue("");
  });
}
