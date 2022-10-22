/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { vite as maverick } from './src/plugins';
import { transform } from './src/transformer';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __NODE__: 'false',
  },
  resolve: {
    alias: {
      'maverick.js/element': '/src/element',
      'maverick.js/dom': '/src/runtime/dom',
      'maverick.js/ssr': '/src/runtime/ssr',
      'maverick.js': '/src/runtime',
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
