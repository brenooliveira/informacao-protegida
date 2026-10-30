import { describe, expect, it } from "vitest";
import {
  findClientLeaks,
  secretNames,
} from "../scripts/check-client-secrets.mjs";
describe("barreira de segredos no cliente", () => {
  it.each(secretNames)("detecta valor vazado de %s", (name) => {
    expect(
      findClientLeaks('const x="sentinel-secret-value-123"', {
        [name]: "sentinel-secret-value-123",
      }),
    ).toContain(name);
  });
  it.each(secretNames)("detecta referência a %s", (name) => {
    expect(findClientLeaks(`process.env.${name}`, {})).toContain(name);
  });
  it("permite chave publicável", () => {
    expect(findClientLeaks("sb_publishable_valid_example", {})).toEqual([]);
  });
  it("detecta chave secreta moderna do Supabase", () => {
    expect(findClientLeaks("sb_secret_abcdefghij1234", {})).toContain(
      "SUPABASE_SECRET_KEY_PATTERN",
    );
  });
  it("detecta JWT service_role mesmo sem env correspondente", () => {
    const token = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
    expect(findClientLeaks(token, {})).toContain("SERVICE_ROLE_JWT");
  });
});
