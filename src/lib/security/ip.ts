import { isIP } from "node:net";
export function truncateIp(input: string): string {
  if (isIP(input) === 4)
    return input.split(".").slice(0, 3).join(".") + ".0/24";
  if (isIP(input) !== 6) throw new Error("IP inválido.");
  let ip = input.toLowerCase();
  if (ip.includes(".")) {
    const start = ip.lastIndexOf(":") + 1;
    const octets = ip.slice(start).split(".").map(Number);
    ip =
      ip.slice(0, start) +
      ((octets[0] << 8) | octets[1]).toString(16) +
      ":" +
      ((octets[2] << 8) | octets[3]).toString(16);
  }
  const parts = ip.split("::");
  const left = parts[0] ? parts[0].split(":") : [];
  const right = parts[1] ? parts[1].split(":") : [];
  const words =
    parts.length === 2
      ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
      : left;
  return (
    words
      .slice(0, 3)
      .map((word) => Number.parseInt(word, 16).toString(16))
      .join(":") + "::/48"
  );
}
export function trustedClientIp(headers: Headers, production: boolean): string {
  // Em localhost não confiar em headers controláveis pelo visitante.
  if (!production) return "127.0.0.1";
  if (process.env.VERCEL !== "1")
    throw new Error("Proxy de produção não configurado.");
  const value = headers.get("x-vercel-forwarded-for")?.trim();
  if (!value || !isIP(value)) throw new Error("IP de origem indisponível.");
  return value;
}
