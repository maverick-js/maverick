import { build } from 'esbuild';

await build({
  entryPoints: ['vite.config.ts'],
  outfile: 'vite.config.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  external: ['vite', 'typescript'],
  define: {
    __DEV__: 'true',
    __SERVER__: 'false',
    __TEST__: 'true',
  },
});
