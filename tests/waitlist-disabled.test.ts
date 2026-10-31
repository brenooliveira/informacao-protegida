import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({ serverEnv: { WAITLIST_ENABLED: false } }));
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/infrastructure/supabase/waitlist", () => ({
  waitlistClient: rpc,
  waitlistDigest: rpc,
  newUnsubscribeToken: rpc,
}));
import { POST as join } from "@/app/api/waitlist/route";
import { POST as leave } from "@/app/api/waitlist/unsubscribe/route";
it.each([join, leave])(
  "lista desativada recusa coleta antes de ler dados ou acessar o banco",
  async (handler) => {
    const request = new Request("https://example.invalid/api/waitlist", {
      method: "POST",
    });
    const read = vi.spyOn(request, "text");
    const response = await handler(request);
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(read).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  },
);
