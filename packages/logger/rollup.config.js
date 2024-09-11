import { nodeResolve } from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

import { copyPkgFiles } from '../../.build/copy-pkg-files.js';

const EXTERNAL = ['typescript'];

export default defineConfig([define(), defineTypes()]);

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
 * @returns {import('rollup').RollupOptions}
 */
function define() {
  return {
    input: {
      index: 'src/index.ts',
    },
    treeshake: true,
    preserveEntrySignatures: 'allow-extension',
    external: EXTERNAL,
    output: {
      format: 'esm',
      dir: `dist-npm`,
      chunkFileNames: `chunks/maverick-[hash].js`,
      compact: false,
      minifyInternalExports: false,
    },
    plugins: [
      nodeResolve({
        exportConditions: ['node', 'production', 'default'],
      }),
      esbuild({
        define: {
          __TEST__: 'false',
        },
      }),
      {
        name: 'copy-pkg-files',
        async buildEnd() {
          await copyPkgFiles();
        },
      },
    ],
  };
}
