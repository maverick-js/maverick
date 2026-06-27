/// <reference types="vite-plus/test" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const entries = {
  index: 'src/core/index.ts',
  'jsx-runtime': 'src/jsx/jsx-runtime.ts',
};

const shared = {
  entry: entries,
  format: 'esm' as const,
  deps: { neverBundle: ['@maverick-js/std'] },
  hash: false,
  clean: false,
  fixedExtension: false,
  outputOptions: { minifyInternalExports: false },
};

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: 'false',
  },
  resolve: {
    alias: {
      '@maverick-js/core/jsx-runtime': r('./src/jsx/jsx-runtime.ts'),
      '@maverick-js/core': r('./src/core/index.ts'),
      '@maverick-js/std': r('../std/src/index.ts'),
    },
  },
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'node',
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
