/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { maverick } from './src/plugins/vite';
import { transform } from './src/transformer';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
  },
  resolve: {
    alias: {
      '@maverick-js/elements': '/src/runtime',
      '@maverick-js/elements/dom': '/src/runtime/dom',
      '@maverick-js/elements/ssr': '/src/runtime/ssr',
    },
  },
  plugins: [
    {
      name: 'maverick-ssr',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('tests/runtime/ssr')) {
          return transform(code, {
            filename: id,
            generate: 'ssr',
            sourcemap: true,
          });
        }
      },
    },
    maverick(),
  ],
  // https://vitest.dev/config
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
});
