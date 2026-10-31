import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHmac, randomBytes } from "node:crypto";
import { serverEnv } from "@/lib/env/server";
import type { Database } from "./database.types";
export function waitlistClient() {
  if (
    !serverEnv.WAITLIST_ENABLED ||
    !serverEnv.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnv.SUPABASE_SERVICE_ROLE_KEY ||
    !serverEnv.WAITLIST_HMAC_SECRET
  )
    throw new Error("Lista de espera não configurada.");
  return createClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export function waitlistDigest(value: string) {
  if (!serverEnv.WAITLIST_HMAC_SECRET)
    throw new Error("Lista de espera não configurada.");
  return createHmac("sha256", serverEnv.WAITLIST_HMAC_SECRET)
    .update(value)
    .digest("hex");
}
export function newUnsubscribeToken() {
  return randomBytes(32).toString("base64url");
}
