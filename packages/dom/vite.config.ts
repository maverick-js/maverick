/// <reference types="vitest" />
import { defineConfig } from 'vite';

const SERVER = !!process.env.SERVER;

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: SERVER ? 'true' : 'false',
  },
  resolve: {
    alias: {
      '@maverick-js/dom': '/src/index.ts',
    },
  },
  // https://vitest.dev/config
  test: {
    include: [`tests/${SERVER ? 'server' : 'client'}/**/*.test.{ts,tsx}`],
    globals: true,
    environment: SERVER ? 'edge-runtime' : 'jsdom',
  },
});
