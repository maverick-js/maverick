import { defineConfig, type Options } from 'tsup';

function base({ dev = false, node = false } = {}): Options {
  return {
    format: 'esm',
    external: ['typescript', 'rollup', 'chokidar', 'esbuild'],
    treeshake: true,
    splitting: true,
    tsconfig: 'tsconfig.build.json',
    target: node ? 'node16' : 'esnext',
    platform: node ? 'node' : 'browser',
    outDir: node ? 'dist/node' : dev ? 'dist/dev' : 'dist/prod',
    define: {
      __DEV__: dev ? 'true' : 'false',
      __NODE__: node ? 'true' : 'false',
      __TEST__: 'false',
    },
    esbuildOptions(opts) {
      opts.chunkNames = 'chunks/[name]-[hash]';
    },
  };
}

const runtimeEntry = {
  runtime: './src/runtime/index.ts',
  dom: './src/runtime/dom/index.ts',
  ssr: './src/runtime/ssr/index.ts',
};

export default defineConfig([
  {
    ...base({ dev: true }),
    entry: runtimeEntry,
  },
  {
    ...base({ dev: false }),
    entry: runtimeEntry,
    dts: true,
  },
  {
    ...base({ node: true }),
    entry: runtimeEntry,
  },
  {
    ...base({ node: true }),
    entry: { plugins: './src/plugins/index.ts' },
    dts: true,
  },
]);
