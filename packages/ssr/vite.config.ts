/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __TEST__: 'true',
  },
  resolve: {
    alias: {
      '@maverick-js/ssr': '/src/index.ts',
    },
  },
  // https://vitest.dev/config
  test: {
    include: [`tests/**/*.test.{ts,tsx}`],
    globals: true,
    environment: 'edge-runtime',
  },
});
