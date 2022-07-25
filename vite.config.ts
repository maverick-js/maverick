/// <reference types="vitest" />

import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  // https://vitest.dev/config
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
});
