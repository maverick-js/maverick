import { defineConfig } from 'vite-plus';

export default defineConfig({
  pack: {
    entry: { index: 'src/index.ts' },
    outDir: 'dist',
    format: 'esm',
    deps: { neverBundle: ['@maverick-js/std', 'typescript'] },
    hash: false,
    fixedExtension: false,
    outputOptions: { minifyInternalExports: false },
    dts: { tsgo: true },
  },
});
