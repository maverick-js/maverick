import { readPackageUp } from 'read-pkg-up';

import { isString, isUndefined } from '../../utils/unit';
import { resolvePath } from './path';

export async function resolveCorePkgName(root: string): Promise<string | undefined> {
  const pkg = await readPackageUp({ cwd: root });
  return pkg?.packageJson.name;
}

export async function resolveConfigPaths<T extends Record<string, unknown>>(
  cwd: string,
  config: T,
  match: (key: keyof T) => boolean = (key) =>
    isString(key) && (key.endsWith('File') || key.endsWith('Dir')),
): Promise<T> {
  const configWithResolvedPaths: T = { ...config };
  const rcwd = cwd.startsWith('.') ? resolvePath(process.cwd(), cwd) : cwd;

  if (Object.keys(config).includes('cwd')) {
    (configWithResolvedPaths as unknown as { cwd: string }).cwd = rcwd;
  }

  Object.keys(config).forEach((key) => {
    if (!isUndefined(config[key]) && match(key)) {
      (configWithResolvedPaths as any)[key] = resolvePath(rcwd, config[key] as string);
    }
  });

  return configWithResolvedPaths;
}
