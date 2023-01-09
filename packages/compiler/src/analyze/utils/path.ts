import { dirname, relative, resolve } from 'path';
import { normalize } from 'pathe';

export const resolvePath = (...pathSegments: string[]): string =>
  normalize(resolve(...pathSegments));

export function resolveRelativePath(from: string, to: string): string {
  const path = relative(dirname(from), to);
  return normalize(path.startsWith('.') ? path : `./${path}`);
}
