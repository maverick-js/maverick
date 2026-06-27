/// <reference types="vite-plus/test" />
import { ssrTransform, type SsrTransformOptions } from '@maverick-js/compiler';
import { maverick } from '@maverick-js/compiler/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: 'true',
  },
  resolve: {
    alias: {
      '@maverick-js/core/jsx-runtime': r('../core/src/jsx/jsx-runtime.ts'),
      '@maverick-js/core': r('../core/src/core/index.ts'),
      '@maverick-js/ssr': r('./src/index.ts'),
      '@maverick-js/std': r('../std/src/index.ts'),
    },
  },
  plugins: [
    maverick({
      transform(data, { id }) {
        const options: SsrTransformOptions = {};

        if (id.includes('custom-element')) {
          options.customElements = true;
        }

        return ssrTransform(data, options);
      },
    }),
  ],
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'edge-runtime',
  },
  pack: {
    entry: { index: 'src/index.ts' },
    outDir: 'dist',
    format: 'esm',
    deps: { neverBundle: ['@maverick-js/core', '@maverick-js/std'] },
    hash: false,
    fixedExtension: false,
    outputOptions: { minifyInternalExports: false },
    dts: { tsgo: true },
    define: { __TEST__: 'false' },
  },
});
