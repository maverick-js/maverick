/// <reference types="vite-plus/test" />
import { defineConfig } from 'vite-plus';

const SERVER = !!process.env.SERVER;

const shared = {
  entry: { index: 'src/index.ts' },
  format: 'esm' as const,
  hash: false,
  clean: false,
  fixedExtension: false,
  outputOptions: { minifyInternalExports: false },
};

export default defineConfig({
  define: {
    __DEV__: 'true',
    __TEST__: 'true',
    __SERVER__: SERVER ? 'true' : 'false',
  },
  resolve: {
    alias: {
      '@maverick-js/std': '/src/index.ts',
    },
  },
  test: {
    include: [`tests/${SERVER ? 'server' : 'client'}/**/*.test.{ts,tsx}`],
    passWithNoTests: SERVER,
    globals: true,
    environment: SERVER ? 'edge-runtime' : 'jsdom',
  },
  pack: [
    {
      ...shared,
      outDir: 'dist/dev',
      dts: { tsgo: true },
      define: { __DEV__: 'true', __SERVER__: 'false', __TEST__: 'false' },
    },
    {
      ...shared,
      outDir: 'dist/prod',
      define: { __DEV__: 'false', __SERVER__: 'false', __TEST__: 'false' },
    },
    {
      ...shared,
      outDir: 'dist/server',
      define: { __DEV__: 'false', __SERVER__: 'true', __TEST__: 'false' },
    },
  ],
});
