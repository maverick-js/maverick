import { defineConfig, type Options } from 'tsup';

function base({ dev = false, server = false, node = false } = {}): Options {
  return {
    format: node || server ? ['esm', 'cjs'] : 'esm',
    external: [
      'typescript',
      'rollup',
      'chokidar',
      'esbuild',
      'react',
      'react-dom',
      'vue',
      'svelte',
      'preact',
      'solid-js',
    ],
    // minify: true,
    treeshake: true,
    splitting: true,
    tsconfig: 'tsconfig.build.json',
    target: node || server ? 'node16' : 'esnext',
    platform: node || server ? 'node' : 'browser',
    outDir: node ? 'dist/node' : server ? 'dist/server' : dev ? 'dist/dev' : 'dist/prod',
    define: {
      __DEV__: dev ? 'true' : 'false',
      __SERVER__: node || server ? 'true' : 'false',
      __TEST__: 'false',
    },
    esbuildOptions(opts) {
      if (!dev && !server && !node) {
        opts.mangleProps = /^_/;
      }

      opts.chunkNames = 'chunks/[name]-[hash]';
    },
  };
}

const runtimeEntry = {
  runtime: './src/runtime/index.ts',
  dom: './src/runtime/dom/index.ts',
  ssr: './src/runtime/ssr/index.ts',
  element: './src/element/index.ts',
  react: './src/react/index.ts',
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
    ...base({ server: true }),
    entry: runtimeEntry,
  },
  {
    ...base({ node: true }),
    entry: {
      analyze: './src/analyze/index.ts',
      cli: './src/cli/index.ts',
      plugins: './src/plugins/index.ts',
    },
    dts: true,
  },
]);
