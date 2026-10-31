import { z } from "zod";
const optionalPublic = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    schema.optional(),
  );
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: optionalPublic(z.url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalPublic(z.string().min(20)),
});
