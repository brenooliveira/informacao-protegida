export async function boundedJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("JSON obrigatório.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Corpo ausente.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) throw new Error("Corpo muito grande.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
  const data = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(data));
}
export function hasAllowedOrigin(
  request: Request,
  appUrl: string,
  production: boolean,
) {
  const expected = new URL(appUrl).origin;
  const origin = request.headers.get("origin");
  return (
    origin === expected ||
    (!production && origin === new URL(request.url).origin)
  );
}
