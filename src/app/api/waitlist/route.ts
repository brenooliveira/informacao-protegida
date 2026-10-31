import { waitlistSchema } from "@/lib/validation/waitlist";
import { boundedJson, hasAllowedOrigin } from "@/lib/security/request";
import { trustedClientIp, truncateIp } from "@/lib/security/ip";
import { serverEnv } from "@/lib/env/server";
import {
  waitlistClient,
  waitlistDigest,
  newUnsubscribeToken,
} from "@/infrastructure/supabase/waitlist";
const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
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
    input = waitlistSchema.parse(await boundedJson(request));
  } catch {
    return Response.json(
      { error: "Informe um e-mail válido e confirme o consentimento." },
      { status: 400, headers },
    );
  }
  try {
    const ip = trustedClientIp(
      request.headers,
      serverEnv.APP_ENV === "production",
      serverEnv.DEPLOYMENT_PLATFORM,
    );
    const token = newUnsubscribeToken();
    const { data, error } = await waitlistClient().rpc("join_waitlist", {
      p_email: input.email,
      p_subject_digest: waitlistDigest("ip:" + ip),
      p_ip_truncated: truncateIp(ip),
      p_token_digest: waitlistDigest("token:" + token),
    });
    if (error) throw new Error("Falha ao registrar.");
    if (data === "rate_limited")
      return Response.json(
        { error: "Muitas tentativas. Aguarde antes de tentar novamente." },
        { status: 429, headers: { ...headers, "Retry-After": "3600" } },
      );
    if (data !== "accepted") throw new Error("Resposta inesperada.");
    return Response.json(
      {
        message:
          "Pedido recebido. Se este e-mail ainda não estava inscrito, ele foi adicionado à lista.",
        token,
      },
      { status: 200, headers },
    );
  } catch {
    return Response.json(
      {
        error: "Não foi possível registrar agora. Tente novamente mais tarde.",
      },
      { status: 503, headers },
    );
  }
}
