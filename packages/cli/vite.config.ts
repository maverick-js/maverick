/// <reference types="vite-plus/test" />
import { defineConfig } from 'vite-plus';

export default defineConfig({
  define: {
    __TEST__: 'true',
  },
  resolve: {
    alias: {
      'maverick.js': '/src',
    },
  },
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'node',
  },
  pack: {
    entry: {
      analyze: 'src/analyze/index.ts',
      cli: 'src/cli/index.ts',
    },
    outDir: 'dist',
    format: 'esm',
    fixedExtension: false,
    platform: 'node',
    target: 'node22',
    dts: { tsgo: true },
    define: { __TEST__: 'false' },
    deps: {
      neverBundle: [
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
    },
    hash: false,
  },
});
