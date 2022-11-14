import normalizePath from 'normalize-path';
import { dirname, relative, resolve } from 'path';

export const resolvePath = (...pathSegments: string[]): string =>
  normalizePath(resolve(...pathSegments));

export function resolveRelativePath(from: string, to: string): string {
  const path = relative(dirname(from), to);
  return normalizePath(path.startsWith('.') ? path : `./${path}`);
}
