import { afterEach, describe, expect, it, vi } from "vitest";
import { waitlistSchema, unsubscribeSchema } from "@/lib/validation/waitlist";
import { truncateIp, trustedClientIp } from "@/lib/security/ip";
import { boundedJson, hasAllowedOrigin } from "@/lib/security/request";
afterEach(() => vi.unstubAllEnvs());
describe("consentimento e requisição", () => {
  it("exige autorização explícita", () => {
    expect(
      waitlistSchema.safeParse({
        email: "teste@example.invalid",
        consent: false,
      }).success,
    ).toBe(false);
    expect(
      waitlistSchema.safeParse({ email: "teste@example.invalid" }).success,
    ).toBe(false);
  });
  it("não permite campos extras e normaliza e-mail", () => {
    expect(
      waitlistSchema.parse({
        email: " Pessoa+tag@Example.invalid ",
        consent: true,
      }).email,
    ).toBe("pessoa+tag@example.invalid");
    expect(
      waitlistSchema.safeParse({
        email: "a@example.invalid",
        consent: true,
        owner_id: "outro",
      }).success,
    ).toBe(false);
  });
  it("token tem comprimento e alfabeto estritos", () => {
    expect(unsubscribeSchema.safeParse({ token: "a".repeat(43) }).success).toBe(
      true,
    );
    expect(unsubscribeSchema.safeParse({ token: "x" }).success).toBe(false);
  });
  it("limita corpo e exige JSON", async () => {
    await expect(
      boundedJson(
        new Request("http://localhost/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ large: "x".repeat(5000) }),
        }),
      ),
    ).rejects.toThrow("Corpo muito grande");
    await expect(
      boundedJson(
        new Request("http://localhost/api", { method: "POST", body: "{}" }),
      ),
    ).rejects.toThrow();
  });
  it("recusa origem externa ou ausente", () => {
    for (const origin of [null, "https://evil.invalid"]) {
      const request = new Request("http://localhost/api", {
        headers: origin ? { origin } : {},
      });
      expect(hasAllowedOrigin(request, "http://localhost", false)).toBe(false);
    }
    expect(
      hasAllowedOrigin(
        new Request("http://localhost/api", {
          headers: { origin: "http://localhost" },
        }),
        "http://localhost",
        false,
      ),
    ).toBe(true);
  });
});
describe("minimização de IP", () => {
  it.each([
    ["192.168.25.255", "192.168.25.0/24"],
    ["2001:db8:abcd:1234::9876", "2001:db8:abcd::/48"],
    ["::1", "0:0:0::/48"],
    ["2001:db8::1", "2001:db8:0::/48"],
  ])("trunca %s", (input, expected) =>
    expect(truncateIp(input)).toBe(expected),
  );
  it("recusa IP malformado", () => expect(() => truncateIp("evil")).toThrow());
  it("ignora spoofing em localhost", () =>
    expect(
      trustedClientIp(
        new Headers({ "x-vercel-forwarded-for": "8.8.8.8" }),
        false,
      ),
    ).toBe("127.0.0.1"));
  it("produção exige proxy Vercel e IP único válido", () => {
    vi.stubEnv("VERCEL", "");
    expect(() => trustedClientIp(new Headers(), true)).toThrow();
    vi.stubEnv("VERCEL", "1");
    expect(
      trustedClientIp(
        new Headers({ "x-vercel-forwarded-for": "8.8.8.8" }),
        true,
      ),
    ).toBe("8.8.8.8");
    expect(() =>
      trustedClientIp(
        new Headers({ "x-vercel-forwarded-for": "8.8.8.8,1.1.1.1" }),
        true,
      ),
    ).toThrow();
  });
});

describe("proxy de produção Cloudflare", () => {
  it("usa o header definido pela plataforma e ignora headers de outros proxies", () => {
    expect(
      trustedClientIp(
        new Headers({
          "cf-connecting-ip": "203.0.113.8",
          "x-forwarded-for": "1.1.1.1",
          "x-vercel-forwarded-for": "8.8.8.8",
        }),
        true,
        "cloudflare",
      ),
    ).toBe("203.0.113.8");
  });
  it.each([undefined, "garbage", "8.8.8.8,1.1.1.1"])(
    "recusa header ausente ou inválido: %s",
    (ip) => {
      expect(() =>
        trustedClientIp(
          new Headers(ip ? { "cf-connecting-ip": ip } : {}),
          true,
          "cloudflare",
        ),
      ).toThrow();
    },
  );
  it("continua ignorando headers em execução local", () => {
    expect(
      trustedClientIp(
        new Headers({ "cf-connecting-ip": "8.8.8.8" }),
        false,
        "cloudflare",
      ),
    ).toBe("127.0.0.1");
  });
});
