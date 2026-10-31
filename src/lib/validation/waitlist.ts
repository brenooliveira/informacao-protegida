import { z } from "zod";
import { emailSchema } from "./email";
export const WAITLIST_CONSENT_VERSION = "waitlist-v1-2026-10-30";
export const WAITLIST_CONSENT_TEXT =
  "Quero receber por e-mail notícias sobre o lançamento do Informação Protegida. Posso cancelar minha inscrição a qualquer momento.";
export const waitlistSchema = z
  .object({
    email: emailSchema,
    consent: z.literal(true, {
      error: "Marque o consentimento para entrar na lista.",
    }),
  })
  .strict();
export const unsubscribeSchema = z
  .object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) })
  .strict();

export const waitlistReceiptSchema = z.object({
  message: z.string(),
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});
export const waitlistMessageSchema = z.object({ message: z.string() });
export const waitlistErrorSchema = z.object({ error: z.string() });
