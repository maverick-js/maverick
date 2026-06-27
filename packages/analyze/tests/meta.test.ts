import {
  TS_NODE,
  createBuildPlugin,
  createDiscoverPlugin,
  type ComponentNode,
  type CustomElementNode,
  type ReactComponentNode,
} from '@maverick-js/analyze';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const replacer = (key, value) => {
  if (key === TS_NODE) return undefined;
  if (key === 'path' && typeof value === 'string') {
    return path.relative(__dirname, value).split(path.sep).join('/');
  }
  return value;
};

it('should build component meta', async () => {
  const meta = await buildMeta(),
    output = path.resolve(__dirname, './meta.json'),
    current = `${JSON.stringify(meta, replacer, 2)}\n`,
    prev = existsSync(output) ? await readFile(output, 'utf-8') : null;

  if (!prev) {
    await writeFile(output, current);
  } else {
    expect(current, 'component meta does not match').toBe(prev);
  }
});

async function buildMeta() {
  const components: any[] = [],
    elements: any[] = [],
    react: any[] = [];

  for (const fixture of ['component.ts', 'custom-element.ts', 'react.tsx']) {
    const filename = path.resolve(__dirname, `./fixtures/${fixture}`),
      program = compileOnce([filename]),
      discoverPlugin = createDiscoverPlugin(),
      buildPlugin = createBuildPlugin(),
      sourceFile = program.getSourceFile(filename)!;

    await discoverPlugin.init!(program);

    let componentNodes: ComponentNode[] | null | undefined,
      customElementNodes: CustomElementNode[] | null | undefined,
      reactNodes: ReactComponentNode[] | null | undefined;

    if (fixture === 'react.tsx') {
      reactNodes = await discoverPlugin.discoverReactComponents?.(sourceFile);
    } else {
      componentNodes = await discoverPlugin.discoverComponents!(sourceFile);
      customElementNodes = await discoverPlugin.discoverCustomElements!(sourceFile);
    }

    await buildPlugin.init!(program);

    if (componentNodes) {
      components.push(
        ...(await Promise.all(componentNodes.map((node) => buildPlugin.buildComponentMeta!(node)))),
      );
    }

    if (customElementNodes) {
      elements.push(
        ...(await Promise.all(
          customElementNodes.map((node) => buildPlugin.buildCustomElementMeta!(node)),
        )),
      );
    }

    if (reactNodes) {
      react.push(
        ...(await Promise.all(
          reactNodes.map((node) => buildPlugin.buildReactComponentMeta!(node)),
        )),
      );
    }

    await discoverPlugin.destroy?.();
    await buildPlugin.destroy?.();
  }

  return { components, elements, react };
}

function compileOnce(rootNames: string[]) {
  const packagesDir = path.resolve(__dirname, '../..');

  return ts.createProgram(rootNames, {
    baseUrl: packagesDir,
    experimentalDecorators: true,
    jsx: ts.JsxEmit.Preserve,
    jsxImportSource: '@maverick-js/core',
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    paths: {
      '@maverick-js/core': ['core/src/core/index.ts'],
      '@maverick-js/core/jsx-runtime': ['core/src/jsx/jsx-runtime.ts'],
      '@maverick-js/element': ['element/src/index.ts'],
      '@maverick-js/react': ['react/src/types.ts'],
      '@maverick-js/std': ['std/src/index.ts'],
    },
    strictNullChecks: true,
    target: ts.ScriptTarget.ESNext,
  });
}
