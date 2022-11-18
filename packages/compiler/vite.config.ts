/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __TEST__: 'true',
  },
  resolve: {
    alias: {
      'maverick.js': '/src',
    },
  },
  // https://vitest.dev/config
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'node',
  },
});
