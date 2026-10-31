import { expect, test } from "@playwright/test";
test("início acessível, honesto e responsivo", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const external: string[] = [];
  page.on("request", (req) => {
    if (!new URL(req.url()).hostname.match(/^(localhost|127\.0\.0\.1)$/))
      external.push(req.url());
  });
  const response = await page.goto("/");
  await page.screenshot({
    path: testInfo.outputPath("inicio.png"),
    fullPage: true,
  });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    /Seus dados estão.*seguros na.*internet/,
  );
  await expect(
    page.getByText(
      "Versão em desenvolvimento · Sem cadastro para verificar senhas",
    ),
  ).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("link", { name: "Como funciona", exact: true })
    .click();
  await expect(page).toHaveURL(/#como-funciona$/);
  await expect(
    page.getByRole("heading", { name: "Conheça sua exposição" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response?.headers()["content-security-policy"]).not.toContain(
    "'unsafe-eval'",
  );
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
test("navegação até as fases e retorno", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "O projeto", exact: true }).click();
  await expect(page).toHaveURL("/projeto");
  await expect(
    page.getByRole("heading", { name: "Etapas do projeto" }),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(7);
  await page.getByRole("link", { name: "Voltar ao início" }).click();
  await expect(page).toHaveURL("/");
});
test("health sem segredos ou falsa conexão com banco", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok", phase: 2 });
});
