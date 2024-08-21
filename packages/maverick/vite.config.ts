/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: 'false',
  },
  resolve: {
    alias: {
      'maverick.js': '/src/core/index.ts',
    },
  },
  // https://vitest.dev/config
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'node',
  },
});
