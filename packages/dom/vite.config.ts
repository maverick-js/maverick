/// <reference types="vite-plus/test" />
import { domTransform, type DomTransformOptions } from '@maverick-js/compiler';
import { maverick } from '@maverick-js/compiler/vite';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url));

const shared = {
  entry: { index: 'src/index.ts' },
  format: 'esm' as const,
  deps: { neverBundle: ['@maverick-js/core', '@maverick-js/std'] },
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
      '@maverick-js/core/jsx-runtime': r('../core/src/jsx/jsx-runtime.ts'),
      '@maverick-js/core': r('../core/src/core/index.ts'),
      '@maverick-js/dom': r('./src/index.ts'),
      '@maverick-js/element': r('../element/src/index.ts'),
      '@maverick-js/std': r('../std/src/index.ts'),
    },
  },
  plugins: [
    maverick({
      transform(data, { id }) {
        const options: DomTransformOptions = {};

        if (id.includes('hydrate')) {
          options.hydratable = true;
        }

        if (id.includes('custom-element')) {
          options.customElements = true;
        }

        if (id.includes('delegate')) {
          options.delegateEvents = true;
        }

        return domTransform(data, options);
      },
    }),
  ],
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    setupFiles: ['./tests/setup.ts'],
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
  ],
});
