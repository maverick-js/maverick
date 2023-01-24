import { defineConfig, type Options } from 'tsup';

function base({ dev = false, server = false } = {}): Options {
  return {
    entry: {
      runtime: './src/runtime/index.ts',
      dom: './src/runtime/dom/index.ts',
      ssr: './src/runtime/ssr/index.ts',
      element: './src/element/index.ts',
      react: './src/react/index.ts',
      std: './src/std/index.ts',
    },
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
        opts.reserveProps = /__html/;
      }

      opts.conditions = dev ? ['development', 'production', 'default'] : ['production', 'default'];
      opts.chunkNames = 'chunks/[name]-[hash]';
    },
  };
}

export default defineConfig([base({ dev: true }), base({ dev: false }), base({ server: true })]);
