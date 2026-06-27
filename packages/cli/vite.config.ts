import { defineConfig } from 'vite-plus';

export default defineConfig({
  define: {
    __TEST__: 'true',
  },
  pack: {
    entry: {
      analyze: 'src/analyze.ts',
      cli: 'src/cli/index.ts',
    },
    outDir: 'dist',
    format: 'esm',
    fixedExtension: false,
    platform: 'node',
    target: 'node22',
    dts: true,
    define: { __TEST__: 'false' },
    deps: {
      neverBundle: [
        '@maverick-js/analyze',
        '@maverick-js/std',
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
        'yargs/helpers',
      ],
    },
    hash: false,
    outputOptions: { minifyInternalExports: false },
  },
});
