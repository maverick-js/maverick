import { nodeResolve } from '@rollup/plugin-node-resolve';
import { build } from 'esbuild';
import { transformSync } from 'esbuild';
import { globbySync } from 'globby';
import fs from 'node:fs/promises';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuildPlugin from 'rollup-plugin-esbuild';

/** @type {Record<string, string | false>} */
let mangleCache = await buildMangleCache();

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
    output: { dir: '.', chunkFileNames: 'dist/types/maverick-[hash].d.ts' },
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
  const shouldMangle = type === 'prod',
    isDev = type === 'dev' || type === 'rsc-dev',
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
    maxParallelFileOps: shouldMangle ? 1 : 20,
    preserveEntrySignatures: 'allow-extension',
    external: ['react'],
    output: {
      format: 'esm',
      dir: isRSC ? `dist/rsc` : `dist/${type}`,
      chunkFileNames: `chunks/maverick-[hash].js`,
    },
    plugins: [
      nodeResolve({
        exportConditions: isDev
          ? ['development', 'production', 'default']
          : ['production', 'default'],
      }),
      esbuildPlugin({
        target: type === 'server' ? 'node18' : 'esnext',
        platform: type === 'server' ? 'node' : 'browser',
        tsconfig: 'tsconfig.build.json',
        minify: false,
        banner: isRSC ? 'import { IS_SERVER } from "@virtual/env";\n' : '',
        define: {
          __DEV__: isDev ? 'true' : 'false',
          __SERVER__: isRSC ? 'IS_SERVER' : type === 'server' ? 'true' : 'false',
          __TEST__: 'false',
        },
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
      },
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

          return result.code;
        },
      },
    ],
  };
}

async function buildMangleCache() {
  let mangleCache = JSON.parse(await fs.readFile('mangle.json', 'utf-8'));

  const result = await build({
    entryPoints: globbySync('src/**'),
    target: 'esnext',
    bundle: true,
    minify: false,
    mangleProps: /^_/,
    reserveProps: /^__/,
    mangleCache,
    write: false,
    outdir: 'dist-esbuild',
  });

  mangleCache = {
    ...mangleCache,
    ...result.mangleCache,
  };

  await fs.writeFile('mangle.json', JSON.stringify(mangleCache, null, 2));

  return mangleCache;
}
