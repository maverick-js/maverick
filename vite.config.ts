/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { maverick } from './src/plugins/vite';

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
  },
  plugins: [maverick()],
  // https://vitest.dev/config
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    environment: 'jsdom',
  },
});
