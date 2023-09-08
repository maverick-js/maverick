import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'node:fs/promises';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

const WATCH_MODE = process.argv.includes('--watch');

export default defineConfig([
  defineTypes(),
  {
    input: {
      analyze: 'src/analyze/index.ts',
      cli: 'src/cli/index.ts',
    },
    output: {
      format: 'esm',
      dir: `dist`,
      chunkFileNames: '[name].js',
    },
    treeshake: true,
    external: [
      'chokidar',
      'crypto',
      'esbuild',
      'globby',
      'node:fs',
      'rollup',
      'typescript',
      'vite',
      'webpack',
      'yargs',
      'yargs/helper',
    ],
    plugins: [
      nodeResolve(),
      esbuild({
        target: 'node18',
        platform: 'node',
        tsconfig: 'tsconfig.build.json',
        define: { __TEST__: 'false' },
      }),
    ],
  },
]);

/** @returns {import('rollup').RollupOptions} */
function defineTypes() {
  return {
    input: {
      analyze: 'types/analyze/index.d.ts',
    },
    output: { dir: '.' },
    plugins: [
      dts(),
      {
        name: 'cleanup',
        async closeBundle() {
          if (!WATCH_MODE) await fs.rm('types', { recursive: true });
        },
      },
    ],
  };
}
