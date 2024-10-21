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
      '@maverick-js/element/server': '/src/server/index.ts',
      '@maverick-js/element': '/src/index.ts',
    },
  },
  // https://vitest.dev/config
  test: SERVER
    ? {
        include: [`tests/server/**/*.test.{ts,tsx}`],
        globals: true,
        environment: 'edge-runtime',
      }
    : {
        include: [`tests/client/**/*.test.{ts,tsx}`],
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
