/// <reference types="vite-plus/test" />
import { defineConfig } from 'vite-plus';

export default defineConfig({
  define: {
    __TEST__: 'true',
  },
  resolve: {
    alias: {
      '@maverick-js/analyze': '/src/index.ts',
    },
  },
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'node',
  },
  pack: {
    entry: { index: 'src/index.ts' },
    outDir: 'dist',
    format: 'esm',
    deps: {
      neverBundle: ['@maverick-js/logger', '@maverick-js/std', 'typescript'],
    },
    hash: false,
    fixedExtension: false,
    outputOptions: { minifyInternalExports: false },
    dts: true,
    define: { __TEST__: 'false' },
  },
});
