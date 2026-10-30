import { z } from "zod";
import { publicEnvSchema } from "./public-schema";
const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(16).optional(),
);
export const serverEnvSchema = publicEnvSchema
  .extend({
    APP_ENV: z.enum(["local", "test", "production"]),
    BREACH_PROVIDER: z.enum(["mock", "hibp"]),
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    HIBP_API_KEY: optionalSecret,
    RESEND_API_KEY: optionalSecret,
    CRON_SECRET: optionalSecret,
    HIBP_RPM: z.coerce.number().int().positive().max(10000).default(10),
    HIBP_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    HIBP_MIN_CHECK_INTERVAL_HOURS: z.coerce.number().int().min(24).default(24),
  })
  .superRefine((env, ctx) => {
    if (env.APP_ENV === "production") {
      if (env.BREACH_PROVIDER === "mock")
        ctx.addIssue({
          code: "custom",
          path: ["BREACH_PROVIDER"],
          message: "Mock proibido em produção",
        });
      for (const key of [
        "SUPABASE_SERVICE_ROLE_KEY",
        "HIBP_API_KEY",
        "RESEND_API_KEY",
        "CRON_SECRET",
      ] as const) {
        if (!env[key])
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Obrigatório em produção",
          });
      }
      for (const key of [
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SUPABASE_URL",
      ] as const) {
        if (!env[key].startsWith("https://"))
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "HTTPS obrigatório em produção",
          });
      }
      if (!/^sb_publishable_/.test(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY))
        ctx.addIssue({
          code: "custom",
          path: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
          message: "Use a chave pública publicável do Supabase",
        });
    }
    if (env.BREACH_PROVIDER === "hibp" && !env.HIBP_API_KEY)
      ctx.addIssue({
        code: "custom",
        path: ["HIBP_API_KEY"],
        message: "Provider real exige chave",
      });
  });
export function parseServerEnv(input: Record<string, unknown>) {
  const parsed = serverEnvSchema.safeParse(input);
  if (!parsed.success) {
    // Não interpolar valores recebidos: podem conter segredos.
    throw new Error(
      `Configuração inválida: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  }
  return parsed.data;
}
