export const secretNames: string[];
export function findClientLeaks(
  content: string,
  env: Record<string, string | undefined>,
): string[];
