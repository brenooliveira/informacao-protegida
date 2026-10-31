import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
afterEach(() => vi.unstubAllEnvs());
it.each([
  "www.informacaoprotegida.com.br",
  "informacao-protegida.breno26.workers.dev",
])("redireciona %s preservando caminho e parâmetros", (hostname) => {
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://informacaoprotegida.com.br");
  const response = proxy(
    new NextRequest(`https://${hostname}/lista-de-espera/cancelar?from=link`),
  );
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe(
    "https://informacaoprotegida.com.br/lista-de-espera/cancelar?from=link",
  );
});
it.each(["informacaoprotegida.com.br", "127.0.0.1", "unknown.invalid"])(
  "não cria loop ou redirecionamento inesperado em %s",
  (hostname) => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://informacaoprotegida.com.br");
    const response = proxy(new NextRequest(`https://${hostname}/`));
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("content-security-policy")).toContain("nonce-");
  },
);
