import { build } from 'esbuild';
import path from 'path';
import { readFile } from 'fs/promises';

async function main() {
  const pkg = JSON.parse(await readFile('package.json', 'utf-8'));
  const deps = Object.keys(pkg.dependencies);

  /** @returns {import('esbuild').BuildOptions} */
  function shared({ dev = false, node = false } = {}) {
    return {
      treeShaking: true,
      format: 'esm',
      bundle: true,
      platform: node ? 'node' : 'browser',
      target: 'esnext',
      write: true,
      watch: hasArg('-w'),
      define: {
        __DEV__: dev ? 'true' : 'false',
        __NODE__: node ? 'true' : 'false',
        __TEST__: 'false',
      },
      external: ['typescript', 'vite', ...deps],
      tsconfig: '.config/tsconfig.build.json',
      plugins: dev
        ? [
            {
              name: 'resolve-observables',
              setup(build) {
                build.onResolve({ filter: /@maverick-js\/obs/ }, () => ({
                  path: path.resolve(
                    process.cwd(),
                    'node_modules/@maverick-js/observables/dist/dev/index.js',
                  ),
                }));
              },
            },
          ]
        : undefined,
    };
  }

  const runtime = (paths) => {
    const entryPoints = paths.map(
      (path) => `src/runtime${path !== 'index' ? `/${path}` : '/'}/index.ts`,
    );

    return Promise.all([
      build({
        ...shared({ dev: true }),
        entryPoints,
        splitting: true,
        outdir: `dist/runtime/dev`,
      }),
      build({
        ...shared({ dev: false }),
        entryPoints,
        minify: true,
        splitting: true,
        outdir: `dist/runtime/prod`,
      }),
      build({
        ...shared({ dev: false, node: true }),
        entryPoints,
        splitting: true,
        outdir: `dist/runtime/node`,
      }),
    ]);
  };

  await Promise.all([
    runtime(['index', 'dom', 'ssr']),
    build({
      ...shared({ node: true }),
      entryPoints: [
        'src/transformer/index.ts',
        ...['esbuild', 'rollup', 'vite', 'webpack'].map((name) => `src/plugins/${name}.ts`),
      ],
      splitting: true,
      outdir: 'dist',
    }),
    // Use this sometimes to check bundle size.
    // build({
    //   ...shared(),
    //   entryPoints: ['src/runtime/index.ts'],
    //   bundle: true,
    //   minify: true,
    //   outfile: 'dist/test.js',
    // }),
  ]);
}

function hasArg(arg) {
  return process.argv.includes(arg);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
