/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { maverick } from './src/plugins/vite';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
  },
  resolve: {
    alias: {
      '@maverick-js/elements': './src/runtime/index.ts',
      '@maverick-js/elements/dom': './src/runtime/dom/index.ts',
      '@maverick-js/elements/ssr': './src/runtime/ssr/index.ts',
    },
  },
  plugins: [maverick()],
  // https://vitest.dev/config
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
});
