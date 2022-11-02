/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { vite as maverick } from './src/plugins';
import { transform } from './src/transformer';

const SERVER = !!process.env.SERVER;

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: SERVER ? 'true' : 'false',
  },
  resolve: {
    alias: {
      'maverick.js/element': '/src/element',
      'maverick.js/dom': '/src/runtime/dom',
      'maverick.js/ssr': '/src/runtime/ssr',
      'maverick.js/transformer': '/src/transformer',
      'maverick.js': '/src/runtime',
    },
  },
  plugins: [
    {
      name: 'maverick-ssr',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('tests/server')) {
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
    include: [`tests/${SERVER ? 'server' : 'client'}/**/*.test.{ts,tsx}`],
    globals: true,
    environment: SERVER ? 'edge-runtime' : 'jsdom',
  },
});
