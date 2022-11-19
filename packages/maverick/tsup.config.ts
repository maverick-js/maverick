import { defineConfig, type Options } from 'tsup';

function base({ dev = false, server = false } = {}): Options {
  return {
    format: server ? ['esm', 'cjs'] : 'esm',
    external: ['typescript', 'react', 'react-dom', 'vue', 'svelte', 'preact', 'solid-js'],
    treeshake: true,
    splitting: true,
    tsconfig: 'tsconfig.build.json',
    target: server ? 'node16' : 'esnext',
    platform: server ? 'node' : 'browser',
    outDir: server ? 'dist/server' : dev ? 'dist/dev' : 'dist/prod',
    define: {
      __DEV__: dev ? 'true' : 'false',
      __SERVER__: server ? 'true' : 'false',
      __TEST__: 'false',
    },
    esbuildOptions(opts) {
      if (!dev && !server) {
        opts.mangleProps = /^_/;
      }

      opts.chunkNames = 'chunks/[name]-[hash]';
    },
  };
}

const entry = {
  runtime: './src/runtime/index.ts',
  dom: './src/runtime/dom/index.ts',
  ssr: './src/runtime/ssr/index.ts',
  element: './src/element/index.ts',
  react: './src/react/index.ts',
  std: './src/std/index.ts',
};

export default defineConfig([
  {
    ...base({ dev: true }),
    entry,
  },
  {
    ...base({ dev: false }),
    entry,
    dts: true,
  },
  {
    ...base({ server: true }),
    entry,
  },
]);
