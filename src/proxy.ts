import { NextRequest, NextResponse } from "next/server";
export function proxy(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.APP_ENV === "production" && appUrl) {
    const canonical = new URL(appUrl);
    const aliases = [
      `www.${canonical.hostname}`,
      "informacao-protegida.breno26.workers.dev",
    ];
    if (
      request.nextUrl.hostname !== canonical.hostname &&
      aliases.includes(request.nextUrl.hostname)
    ) {
      const target = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        canonical,
      );
      return NextResponse.redirect(target, 308);
    }
  }
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' https://api.pwnedpasswords.com ${supabaseOrigin}${dev ? " ws://localhost:*" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
