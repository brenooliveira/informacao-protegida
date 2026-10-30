import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw/http";
import { mockServer } from "./setup";
import {
  fingerprintPassword,
  parsePasswordRange,
  checkPasswordRange,
} from "@/lib/passwords/pwned-passwords";
const suffix = "1E4C9B93F3F0682250B6CF8331B7EE68FD8";
const padding = "0".repeat(35) + ":0";
describe("verificação privada de senhas", () => {
  it("calcula SHA-1 local e separa exatamente 5/35 caracteres", async () => {
    expect(await fingerprintPassword("password")).toEqual({
      prefix: "5BAA6",
      suffix,
    });
  });
  it("não normaliza espaços nem Unicode", async () => {
    expect(await fingerprintPassword(" password ")).not.toEqual(
      await fingerprintPassword("password"),
    );
    expect(await fingerprintPassword("café")).not.toEqual(
      await fingerprintPassword("cafe"),
    );
  });
  it("compara sufixo e descarta padding", () => {
    expect(parsePasswordRange(`${padding}\r\n${suffix}:1234`, suffix)).toBe(
      1234,
    );
    expect(parsePasswordRange(`${suffix}:0`, suffix)).toBe(0);
  });
  it("ausência só é válida após ler resposta bem formada", () => {
    expect(parsePasswordRange(padding, suffix)).toBe(0);
  });
  it.each([
    "",
    "<html>erro</html>",
    "ABC:10",
    `${suffix}:oops`,
    `${suffix}:90071992547409999`,
    `${suffix}:-1`,
  ])(
    "recusa resposta malformada sem produzir falso resultado limpo",
    (body) => {
      expect(() => parsePasswordRange(body, suffix)).toThrow();
    },
  );
  it("envia só prefixo, sem corpo/credenciais e com padding", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    mockServer.use(
      http.get(
        "https://api.pwnedpasswords.com/range/:prefix",
        ({ request, params }) => {
          expect(params.prefix).toBe("5BAA6");
          expect(request.method).toBe("GET");
          expect(request.body).toBeNull();
          expect(request.url).not.toContain(suffix);
          expect(request.headers.get("Add-Padding")).toBe("true");
          expect(request.headers.get("cookie")).toBeNull();
          return HttpResponse.text(`${suffix}:42\r\n${padding}`);
        },
      ),
    );
    expect(await checkPasswordRange({ prefix: "5BAA6", suffix })).toBe(42);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.pwnedpasswords.com/range/5BAA6",
      expect.objectContaining({
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
      }),
    );
  });
  it.each([400, 401, 403, 404, 429, 503])(
    "HTTP %s não é senha ausente",
    async (status) => {
      mockServer.use(
        http.get(
          "https://api.pwnedpasswords.com/range/:prefix",
          () => new HttpResponse(null, { status }),
        ),
      );
      await expect(
        checkPasswordRange({ prefix: "5BAA6", suffix }),
      ).rejects.toThrow();
    },
  );
  it("interrupção/timeout não vira ausência", async () => {
    const control = new AbortController();
    control.abort();
    await expect(
      checkPasswordRange({ prefix: "5BAA6", suffix }, control.signal),
    ).rejects.toThrow();
  });
  it("prefixo inválido não gera chamada", async () => {
    await expect(
      checkPasswordRange({ prefix: "password", suffix }),
    ).rejects.toThrow("Prefixo inválido");
  });
});
