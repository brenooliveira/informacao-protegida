import { describe, expect, it } from "vitest";
import { emailSchema } from "@/lib/validation/email";
describe("entrada compartilhada de e-mail", () => {
  it("normaliza sem remover aliases legítimos", () => {
    expect(emailSchema.parse("  Pessoa+teste@Example.com  ")).toBe(
      "pessoa+teste@example.com",
    );
  });
  it.each(["", "sem-arroba", "x@", "a".repeat(255) + "@example.com"])(
    "recusa entrada inválida",
    (value) => {
      expect(emailSchema.safeParse(value).success).toBe(false);
    },
  );
});
