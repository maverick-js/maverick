import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { createUnplugin } from 'unplugin';

import { transform, TransformFeatures, type TransformOptions } from '../transformer';
import type { LogLevelName } from '../utils/logger';
import { isUndefined } from '../utils/unit';

export interface ResolvedOptions extends TransformFeatures {
  logLevel: LogLevelName;
  include: FilterPattern;
  exclude: FilterPattern;
  /** Filter files that should be logged verbosely. */
  debug: FilterPattern | undefined;
  hydratable: boolean | ((id: string) => boolean | null) | null;
  pretty: boolean | null;
  generate: TransformOptions['generate'] | null;
}

export type Options = Partial<ResolvedOptions>;

function resolveOptions(options: Options): ResolvedOptions {
  return {
    logLevel: 'warn',
    include: /\.(j|t)sx/,
    exclude: /[\\/]node_modules[\\/]/,
    debug: undefined,
    hydratable: null,
    generate: null,
    pretty: null,
    diffArrays: true,
    delegateEvents: false,
    groupDOMEffects: false,
    ...options,
  };
}

export const unplugin = createUnplugin((options: Options = {}) => {
  let {
    logLevel,
    include,
    exclude,
    debug,
    hydratable,
    generate,
    pretty,
    diffArrays,
    delegateEvents,
    groupDOMEffects,
  } = resolveOptions(options);

  const filter = createFilter(include, exclude);
  const debugFilter = !isUndefined(debug) ? createFilter(debug) : null;

  const transformCode = (code: string, filename: string, ssr = false) =>
    transform(code, {
      logLevel: debugFilter?.(filename) ? 'verbose' : logLevel,
      filename,
      hydratable: (typeof hydratable === 'boolean' ? hydratable : hydratable?.(filename)) ?? ssr,
      generate: generate ?? (ssr ? 'ssr' : 'dom'),
      sourcemap: true,
      pretty: pretty ?? true,
      diffArrays,
      delegateEvents,
      groupDOMEffects,
    });

  return {
    name: 'maverick.js',
    enforce: 'pre',
    transformInclude(id) {
      return filter(id);
    },
    transform(code, id) {
      return transformCode(code, id);
    },
    vite: {
      config() {
        return {
          optimizeDeps: {
            exclude: ['maverick.js'],
          },
        };
      },
      configResolved(config) {
        if (config.env.MODE === 'test') generate = generate ?? 'dom';
        if (config.isProduction) pretty = false;
      },
      transform(code, id, options) {
        return filter(id) ? transformCode(code, id, options?.ssr) : null;
      },
    },
  };
});

export const vite = unplugin.vite;
export const rollup = unplugin.rollup;
export const esbuild = unplugin.esbuild;
