/// <reference types="vitest" />
import { vite as maverick, transform } from '@maverick-js/compiler';
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
      'maverick.js/element': '/src/element',
      'maverick.js/dom': '/src/runtime/dom',
      'maverick.js/react': '/src/react',
      'maverick.js/ssr': '/src/runtime/ssr',
      'maverick.js/std': '/src/std',
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
    include: [`tests/${SERVER ? 'server' : 'client'}/**/*.test.{ts,tsx}`],
    globals: true,
    environment: SERVER ? 'edge-runtime' : 'jsdom',
  },
});
