/// <reference types="vite-plus/test" />
import { defineConfig } from 'vite-plus';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: 'false',
  },
  resolve: {
    alias: {
      '@maverick-js/compiler/vite': '/src/vite.ts',
      '@maverick-js/compiler': '/src/index.ts',
    },
  },
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'node',
  },
  pack: {
    entry: {
      index: 'src/index.ts',
      vite: 'src/vite.ts',
    },
    outDir: 'dist',
    format: 'esm',
    deps: {
      neverBundle: [
        '@maverick-js/logger',
        '@maverick-js/std',
        '@maverick-js/ts',
        'typescript',
        'vite',
      ],
    },
    hash: false,
    fixedExtension: false,
    outputOptions: { minifyInternalExports: false },
    dts: { tsgo: true },
    define: { __TEST__: 'false' },
  },
});
