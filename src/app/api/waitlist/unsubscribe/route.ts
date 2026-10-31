import { unsubscribeSchema } from "@/lib/validation/waitlist";
import { boundedJson, hasAllowedOrigin } from "@/lib/security/request";
import { trustedClientIp } from "@/lib/security/ip";
import { serverEnv } from "@/lib/env/server";
import {
  waitlistClient,
  waitlistDigest,
} from "@/infrastructure/supabase/waitlist";
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (!serverEnv.WAITLIST_ENABLED)
    return Response.json(
      { error: "Inscrições indisponíveis nesta versão." },
      { status: 503, headers },
    );
  if (
    !hasAllowedOrigin(
      request,
      serverEnv.NEXT_PUBLIC_APP_URL,
      serverEnv.APP_ENV === "production",
    )
  )
    return Response.json(
      { error: "Origem não permitida." },
      { status: 403, headers },
    );
  let input;
  try {
    input = unsubscribeSchema.parse(await boundedJson(request));
  } catch {
    return Response.json({ error: "Link inválido." }, { status: 400, headers });
  }
  try {
    const ip = trustedClientIp(
      request.headers,
      serverEnv.APP_ENV === "production",
      serverEnv.DEPLOYMENT_PLATFORM,
    );
    const { data, error } = await waitlistClient().rpc("leave_waitlist", {
      p_token_digest: waitlistDigest("token:" + input.token),
      p_subject_digest: waitlistDigest("ip:" + ip),
    });
    if (error) throw new Error("Falha ao cancelar.");
    if (data === "rate_limited")
      return Response.json(
        { error: "Muitas tentativas. Tente mais tarde." },
        { status: 429, headers },
      );
    if (data !== "accepted") throw new Error("Resposta inesperada.");
    return Response.json(
      {
        message:
          "Se o link era válido, a inscrição e seus dados foram removidos.",
      },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "Não foi possível cancelar agora. Tente mais tarde." },
      { status: 503, headers },
    );
  }
}
