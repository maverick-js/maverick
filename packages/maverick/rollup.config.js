import { nodeResolve } from '@rollup/plugin-node-resolve';
import { transformSync } from 'esbuild';
import fs from 'node:fs/promises';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuildPlugin from 'rollup-plugin-esbuild';

export default defineConfig([
  // dev
  define({ dev: true }),
  // prod
  define({ dev: false }),
  // server
  define({ dev: true, server: true }),
  // types
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
    output: { dir: '.', chunkFileNames: 'dist/types/[name].ts' },
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

/** @returns {import('rollup').RollupOptions} */
function define({ dev = false, server = false }) {
  const alias = server ? 'server' : dev ? 'dev' : 'prod',
    shouldMangle = !dev && !server;

  /** @type {Record<string, string | false>} */
  let mangleCache = {};

  return {
    input: {
      index: 'src/core/index.ts',
      element: 'src/element/index.ts',
      react: 'src/react/index.ts',
      std: 'src/std/index.ts',
    },
    treeshake: true,
    maxParallelFileOps: shouldMangle ? 1 : 20,
    preserveEntrySignatures: 'allow-extension',
    external: ['react'],
    output: {
      format: 'esm',
      dir: `dist/${alias}`,
      chunkFileNames: `[name].js`,
    },
    plugins: [
      nodeResolve({
        exportConditions: dev
          ? ['development', 'production', 'default']
          : ['production', 'default'],
      }),
      esbuildPlugin({
        target: server ? 'node18' : 'esnext',
        platform: server ? 'node' : 'browser',
        tsconfig: 'tsconfig.build.json',
        minify: false,
        define: {
          __DEV__: dev ? 'true' : 'false',
          __SERVER__: server ? 'true' : 'false',
          __TEST__: 'false',
        },
      }),
      shouldMangle && {
        name: 'mangle',
        transform(code) {
          const result = transformSync(code, {
            target: 'esnext',
            minify: false,
            mangleProps: /^_/,
            mangleCache,
            loader: 'ts',
          });

          mangleCache = {
            ...mangleCache,
            ...result.mangleCache,
          };

          return result.code;
        },
      },
    ],
  };
}
