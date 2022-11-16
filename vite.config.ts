/// <reference types="vitest" />
import { defineConfig } from 'vite';

import { vite as maverick } from './src/plugins';
import { transform } from './src/transformer';

const NODE = !!process.env.MK_NODE;
const SERVER = !!process.env.MK_SERVER;

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: NODE || SERVER ? 'true' : 'false',
  },
  resolve: {
    alias: {
      'maverick.js/analyze': '/src/analyze',
      'maverick.js/element': '/src/element',
      'maverick.js/dom': '/src/runtime/dom',
      'maverick.js/react': '/src/react',
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
    maverick({
      include: ['tests/**/*.{jsx,tsx}'],
      hydratable: (id) => (id.includes('hydrate') ? true : null),
    }),
  ],
  // https://vitest.dev/config
  test: {
    include: [`tests/${NODE ? 'node' : SERVER ? 'server' : 'client'}/**/*.test.{ts,tsx}`],
    globals: true,
    environment: NODE ? 'node' : SERVER ? 'edge-runtime' : 'jsdom',
  },
});
