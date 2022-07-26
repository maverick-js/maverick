import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { createUnplugin } from 'unplugin';
import { type LogLevelName } from '../utils/logger';
import { transform, type TransformOptions } from '../transformer';

export type ResolvedOptions = {
  logLevel: LogLevelName;
  include: FilterPattern;
  exclude: FilterPattern;
  generate: TransformOptions['generate'] | null;
};

export type Options = Partial<ResolvedOptions>;

function resolveOptions(options: Options): ResolvedOptions {
  return {
    logLevel: 'warn',
    include: /\.(j|t)sx/,
    exclude: /[\\/]node_modules[\\/]/,
    generate: null,
    ...options,
  };
}

export const unplugin = createUnplugin((options: Options = {}) => {
  let { logLevel, include, exclude, generate } = resolveOptions(options);

  const filter = createFilter(include, exclude);

  const transformCode = (code: string, filename: string, ssr = false) =>
    transform(code, {
      logLevel,
      filename,
      generate: generate ?? (ssr ? 'ssr' : 'dom'),
      sourcemap: true,
    });

  return {
    name: '@maverick/elements',
    enforce: 'pre',
    transformInclude(id) {
      return filter(id);
    },
    transform(code, id) {
      return transformCode(code, id);
    },
    vite: {
      configResolved(config) {
        if (config.env.MODE === 'test') generate = 'dom';
      },
      transform(code, id, options) {
        return filter(id) ? transformCode(code, id, options?.ssr) : null;
      },
    },
  };
});

export const vite = unplugin.vite;
export const rollup = unplugin.rollup;
export const webpack = unplugin.webpack;
export const esbuild = unplugin.esbuild;
