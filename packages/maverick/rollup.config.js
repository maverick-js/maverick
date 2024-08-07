import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import sucrase from '@rollup/plugin-sucrase';
import fs from 'node:fs/promises';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

export default defineConfig([
  define({ type: 'dev' }),
  define({ type: 'prod' }),
  define({ type: 'server' }),
  define({ type: 'rsc-dev' }),
  define({ type: 'rsc-prod' }),
  defineTypes(),
]);

/** @returns {import('rollup').RollupOptions} */
function defineTypes() {
  return {
    input: {
      index: 'types/core/index.d.ts',
      element: 'types/element/index.d.ts',
      react: 'types/react/index.d.ts',
      std: 'types/std/index.d.ts',
    },
    output: {
      dir: '.',
      chunkFileNames: 'dist/types/maverick-[hash].d.ts',
      compact: false,
      minifyInternalExports: false,
    },
    external: ['react'],
    plugins: [
      dts({ respectExternal: true }),
      {
        name: 'cleanup',
        async closeBundle() {
          await fs.rm('types', { recursive: true });
        },
      },
    ],
  };
}

/**
 * @typedef {{
 *   type: 'dev' | 'prod' | 'server' | 'rsc-dev' | 'rsc-prod';
 * }} BundleOptions
 */

/**
 * @param {BundleOptions}
 * @returns {import('rollup').RollupOptions}
 */
function define({ type = 'dev' }) {
  const isDev = type === 'dev' || type === 'rsc-dev',
    isRSC = type.startsWith('rsc');

  return {
    input: isRSC
      ? { [type.replace('rsc-', '')]: 'src/react/rsc.ts' }
      : {
          index: 'src/core/index.ts',
          element: 'src/element/index.ts',
          react: 'src/react/index.ts',
          std: 'src/std/index.ts',
        },
    treeshake: true,
    preserveEntrySignatures: 'allow-extension',
    external: ['react'],
    output: {
      format: 'esm',
      dir: isRSC ? `dist/rsc` : `dist/${type}`,
      chunkFileNames: `chunks/maverick-[hash].js`,
      compact: false,
      minifyInternalExports: false,
    },
    plugins: [
      nodeResolve({
        exportConditions: isDev
          ? ['development', 'production', 'default']
          : ['production', 'default'],
      }),
      sucrase({
        disableESTransforms: true,
        exclude: ['node_modules/**'],
        transforms: ['typescript'],
      }),
      replace({
        preventAssignment: true,
        __DEV__: isDev ? 'true' : 'false',
        __SERVER__: isRSC ? 'IS_SERVER' : type === 'server' ? 'true' : 'false',
        __TEST__: 'false',
      }),
      {
        name: 'env',
        resolveId(id) {
          if (id === '@virtual/env') return id;
        },
        load(id) {
          if (id === '@virtual/env') {
            return `export const IS_SERVER = typeof document === 'undefined';`;
          }
        },
        transform: isRSC
          ? (code, id) => {
              if (id === '@virtual/env') return;
              return 'import { IS_SERVER } from "@virtual/env";\n' + code;
            }
          : undefined,
      },
    ],
  };
}
