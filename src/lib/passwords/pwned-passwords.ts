// Executado no navegador. Nenhum endpoint do produto recebe senha/hash/prefixo.
export async function fingerprintPassword(value: string) {
  const bytes = new TextEncoder().encode(value);
  try {
    const digest = await crypto.subtle.digest("SHA-1", bytes);
    const hash = Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    )
      .join("")
      .toUpperCase();
    return { prefix: hash.slice(0, 5), suffix: hash.slice(5) };
  } finally {
    bytes.fill(0);
  }
}
export function parsePasswordRange(body: string, suffix: string): number {
  if (!/^[A-F0-9]{35}$/.test(suffix) || body.length > 2_000_000)
    throw new Error("Resposta inválida do serviço.");
  const lines = body.trim().split(/\r?\n/);
  if (!body.trim() || lines.length > 30000)
    throw new Error("Resposta inválida do serviço.");
  let occurrences = 0;
  for (const line of lines) {
    const match = /^([A-F0-9]{35}):(\d+)$/.exec(line);
    if (!match) throw new Error("Resposta inválida do serviço.");
    const count = Number(match[2]);
    if (!Number.isSafeInteger(count))
      throw new Error("Resposta inválida do serviço.");
    if (count > 0 && match[1] === suffix) occurrences = count;
  }
  return occurrences;
}
export async function checkPasswordRange(
  fingerprint: { prefix: string; suffix: string },
  signal: AbortSignal = AbortSignal.timeout(10000),
) {
  if (!/^[A-F0-9]{5}$/.test(fingerprint.prefix))
    throw new Error("Prefixo inválido.");
  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${fingerprint.prefix}`,
    {
      method: "GET",
      headers: { "Add-Padding": "true" },
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      signal,
    },
  );
  if (!response.ok)
    throw new Error("Não foi possível consultar o serviço agora.");
  return parsePasswordRange(await response.text(), fingerprint.suffix);
}
