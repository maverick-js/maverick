import { defineConfig } from 'tsup';

export default defineConfig([
  {
    format: ['esm', 'cjs'],
    external: ['typescript', 'rollup', 'chokidar', 'esbuild', 'webpack', 'vite'],
    treeshake: true,
    splitting: true,
    tsconfig: 'tsconfig.build.json',
    target: 'node16',
    platform: 'node',
    outDir: 'dist',
    define: {
      __TEST__: 'false',
    },
    esbuildOptions(opts) {
      opts.chunkNames = 'chunks/[name]-[hash]';
    },
    entry: {
      analyze: './src/analyze/index.ts',
      cli: './src/cli/index.ts',
      index: './src/index.ts',
    },
  },
]);
