/// <reference types="vite-plus/test" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const SERVER = !!process.env.SERVER;

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const shared = {
  entry: { index: 'src/index.ts' },
  format: 'esm' as const,
  deps: {
    neverBundle: ['@maverick-js/core', '@maverick-js/dom', '@maverick-js/ssr', '@maverick-js/std'],
  },
  hash: false,
  clean: false,
  fixedExtension: false,
  outputOptions: { minifyInternalExports: false },
};

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: SERVER ? 'true' : 'false',
  },
  resolve: {
    alias: {
      '@maverick-js/core/jsx-runtime': r('../core/src/jsx/jsx-runtime.ts'),
      '@maverick-js/core': r('../core/src/core/index.ts'),
      '@maverick-js/dom': r('../dom/src/index.ts'),
      '@maverick-js/element': r('./src/index.ts'),
      '@maverick-js/ssr': r('../ssr/src/index.ts'),
      '@maverick-js/std': r('../std/src/index.ts'),
    },
  },
  test: SERVER
    ? {
        include: [`tests/server/**/*.test.{ts,tsx}`],
        passWithNoTests: true,
        globals: true,
        environment: 'edge-runtime',
      }
    : {
        include: [`tests/client/**/*.test.{ts,tsx}`],
        globals: true,
        environment: 'jsdom',
      },
  pack: [
    {
      ...shared,
      outDir: 'dist/dev',
      dts: { tsgo: true },
      define: { __DEV__: 'true', __SERVER__: 'false', __TEST__: 'false' },
    },
    {
      ...shared,
      outDir: 'dist/prod',
      define: { __DEV__: 'false', __SERVER__: 'false', __TEST__: 'false' },
    },
    {
      ...shared,
      outDir: 'dist/server',
      define: { __DEV__: 'false', __SERVER__: 'true', __TEST__: 'false' },
    },
  ],
});
