import { build } from 'esbuild';
import { readFile } from 'fs/promises';

async function main() {
  const pkg = JSON.parse(await readFile('package.json', 'utf-8'));
  const deps = Object.keys(pkg.dependencies);

  /** @returns {import('esbuild').BuildOptions} */
  function shared({ dev = false } = {}) {
    return {
      treeShaking: true,
      format: 'esm',
      bundle: true,
      platform: 'browser',
      target: 'esnext',
      write: true,
      watch: hasArg('-w'),
      define: {
        __DEV__: dev ? 'true' : 'false',
      },
      external: ['typescript', 'vite', ...deps],
      tsconfig: '.config/tsconfig.build.json',
    };
  }

  const runtime = (path) => {
    const entryPoints = [`src/runtime${path !== 'index' ? `/${path}` : '/'}/index.ts`];
    return Promise.all([
      build({
        ...shared({ dev: true }),
        entryPoints,
        outfile: `dist/runtime/dev/${path}.js`,
      }),
      build({
        ...shared({ dev: false }),
        entryPoints,
        outfile: `dist/runtime/prod/${path}.js`,
      }),
    ]);
  };

  await Promise.all([
    runtime('index'),
    runtime('dom'),
    runtime('ssr'),
    build({
      ...shared(),
      entryPoints: [
        'src/transformer/index.ts',
        ...['esbuild', 'rollup', 'vite', 'webpack'].map((name) => `src/plugins/${name}.ts`),
      ],
      platform: 'node',
      splitting: true,
      outdir: 'dist',
    }),
  ]);
}

function hasArg(arg) {
  return process.argv.includes(arg);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
