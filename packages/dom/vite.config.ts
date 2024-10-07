/// <reference types="vitest" />
import { domTransform, type DomTransformOptions } from '@maverick-js/compiler';
import { maverick } from '@maverick-js/compiler/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: 'false',
  },
  resolve: {
    alias: {
      '@maverick-js/dom': '/src/index.ts',
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
  // https://vitest.dev/config
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      name: 'chromium',
      screenshotFailures: false,
    },
  },
});
