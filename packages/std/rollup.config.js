import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

import { copyPkgFiles } from '../../.build/copy-pkg-files.js';

const EXTERNAL = [];

export default defineConfig([
  define({ type: 'dev' }),
  define({ type: 'prod' }),
  define({ type: 'server' }),
  defineTypes(),
]);

/** @returns {import('rollup').RollupOptions} */
function defineTypes() {
  return {
    input: {
      index: 'types/index.d.ts',
    },
    output: {
      dir: 'dist-npm',
      chunkFileNames: 'dist-npm/types/maverick-[hash].d.ts',
      compact: false,
      minifyInternalExports: false,
    },
    external: EXTERNAL,
    plugins: [dts({ respectExternal: true })],
  };
}

/**
 * @typedef {{
 *   type: 'dev' | 'prod' | 'server'
 * }} BundleOptions
 */

/**
 * @param {BundleOptions}
 * @returns {import('rollup').RollupOptions}
 */
function define({ type = 'dev' }) {
  const isDev = type === 'dev';

  return {
    input: {
      index: 'src/index.ts',
    },
    treeshake: true,
    preserveEntrySignatures: 'allow-extension',
    external: EXTERNAL,
    output: {
      format: 'esm',
      dir: `dist-npm/${type}`,
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
      esbuild({
        define: {
          __DEV__: isDev ? 'true' : 'false',
          __SERVER__: type === 'server' ? 'true' : 'false',
          __TEST__: 'false',
        },
      }),
      isDev && {
        name: 'copy-pkg-files',
        async buildEnd() {
          await copyPkgFiles();
        },
      },
    ],
  };
}
