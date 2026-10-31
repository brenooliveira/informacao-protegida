import { describe, expect, it } from "vitest";
import { parseServerEnv } from "@/lib/env/schema";
const local = {
  APP_ENV: "local",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_example_123",
  BREACH_PROVIDER: "mock",
};
describe("configuração de ambiente", () => {
  it("aceita stack local sem credenciais de serviços não implementados", () => {
    expect(parseServerEnv(local).HIBP_RPM).toBe(10);
  });
  it.each([
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "APP_ENV",
    "BREACH_PROVIDER",
  ])("recusa ausência de %s", (key) => {
    expect(() => parseServerEnv({ ...local, [key]: undefined })).toThrow(
      "Configuração inválida",
    );
  });
  it("recusa mock em produção mesmo com segredos", () => {
    expect(() =>
      parseServerEnv({
        ...local,
        APP_ENV: "production",
        SUPABASE_SERVICE_ROLE_KEY: "a".repeat(32),
        HIBP_API_KEY: "b".repeat(32),
        RESEND_API_KEY: "c".repeat(32),
        CRON_SECRET: "d".repeat(32),
        WAITLIST_HMAC_SECRET: "e".repeat(32),
      }),
    ).toThrow("BREACH_PROVIDER");
  });
  it("exige chave para provider real", () => {
    expect(() => parseServerEnv({ ...local, BREACH_PROVIDER: "hibp" })).toThrow(
      "HIBP_API_KEY",
    );
  });
  it.each([0, -1, 2.5, "abc"])("recusa RPM inválido: %s", (rpm) => {
    expect(() => parseServerEnv({ ...local, HIBP_RPM: rpm })).toThrow(
      "HIBP_RPM",
    );
  });
  it("indexação é opt-in e só aceita booleano textual", () => {
    expect(parseServerEnv(local).SITE_INDEXABLE).toBe(false);
    expect(
      parseServerEnv({ ...local, SITE_INDEXABLE: "true" }).SITE_INDEXABLE,
    ).toBe(true);
    expect(() => parseServerEnv({ ...local, SITE_INDEXABLE: "yes" })).toThrow(
      "SITE_INDEXABLE",
    );
  });
  it("recusa cache menor que 24h", () => {
    expect(() =>
      parseServerEnv({ ...local, HIBP_MIN_CHECK_INTERVAL_HOURS: 1 }),
    ).toThrow();
  });
  it("não imprime o valor de um segredo inválido", () => {
    try {
      parseServerEnv({ ...local, HIBP_API_KEY: "secret-value" });
    } catch (error) {
      expect(String(error)).not.toContain("secret-value");
    }
  });
  it("aceita configuração completa de produção com HTTPS e provider real", () => {
    expect(
      parseServerEnv({
        ...local,
        APP_ENV: "production",
        BREACH_PROVIDER: "hibp",
        NEXT_PUBLIC_APP_URL: "https://informacaoprotegida.com.br",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "a".repeat(32),
        HIBP_API_KEY: "b".repeat(32),
        RESEND_API_KEY: "c".repeat(32),
        CRON_SECRET: "d".repeat(32),
        WAITLIST_HMAC_SECRET: "e".repeat(32),
      }).APP_ENV,
    ).toBe("production");
  });
});

describe("publicação por recurso habilitado", () => {
  const siteOnly = {
    APP_ENV: "production",
    NEXT_PUBLIC_APP_URL: "https://informacao-protegida.breno26.workers.dev",
    BREACH_PROVIDER: "disabled",
    DEPLOYMENT_PLATFORM: "cloudflare",
    WAITLIST_ENABLED: "false",
  };
  it("permite publicar o verificador sem credenciais de recursos desativados", () => {
    const env = parseServerEnv(siteOnly);
    expect(env.WAITLIST_ENABLED).toBe(false);
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(env.SITE_INDEXABLE).toBe(false);
  });
  it("não ativa a lista implicitamente sem banco e segredos reais", () => {
    expect(() =>
      parseServerEnv({ ...siteOnly, WAITLIST_ENABLED: "true" }),
    ).toThrow("SUPABASE");
    expect(() =>
      parseServerEnv({ ...siteOnly, WAITLIST_ENABLED: undefined }),
    ).toThrow("SUPABASE");
  });
  it("exige somente os segredos do recurso implementado", () => {
    expect(
      parseServerEnv({
        ...siteOnly,
        WAITLIST_ENABLED: "true",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "sb_publishable_example_for_tests",
        SUPABASE_SERVICE_ROLE_KEY: "a".repeat(32),
        WAITLIST_HMAC_SECRET: "b".repeat(32),
      }).WAITLIST_ENABLED,
    ).toBe(true);
  });
  it("recusa configuração insegura em produção e opções inválidas", () => {
    for (const input of [
      { ...siteOnly, NEXT_PUBLIC_APP_URL: "http://localhost:3000" },
      { ...siteOnly, DEPLOYMENT_PLATFORM: "untrusted" },
      { ...siteOnly, WAITLIST_ENABLED: "yes" },
    ])
      expect(() => parseServerEnv(input)).toThrow();
  });
});
