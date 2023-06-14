import { dirname, normalize, relative, resolve } from 'pathe';

export const resolvePath = (...pathSegments: string[]): string =>
  normalize(resolve(...pathSegments));

export function resolveRelativePath(from: string, to: string): string {
  const path = relative(dirname(from), to);
  return normalize(path.startsWith('.') ? path : `./${path}`);
}
