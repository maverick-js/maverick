import type {
  ComponentNode,
  CustomElementNode,
  ReactComponentNode,
} from '@maverick-js/core/analyze';
import { TS_NODE } from '@maverick-js/core/analyze/meta/symbols';
import { createBuildPlugin } from '@maverick-js/core/analyze/plugins/build-plugin';
import { createDiscoverPlugin } from '@maverick-js/core/analyze/plugins/discover-plugin';
import { compileOnce } from '@maverick-js/core/cli/compile';
import { testDiagnostics } from '@maverick-js/core/utils/logger';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

afterEach(() => {
  testDiagnostics.splice(0, testDiagnostics.length);
});

const replacer = (key, value) => (key !== TS_NODE ? value : undefined);

it('should build component meta', async () => {
  const meta = await buildMeta(),
    output = path.resolve(__dirname, './meta.json'),
    current = JSON.stringify(meta, replacer, 2),
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
