import ts from 'typescript';

import { createDiscoverPlugin } from 'maverick.js/analyze/plugins/discover-plugin';
import { testDiagnostics } from 'maverick.js/utils/logger';

afterEach(() => {
  testDiagnostics.splice(0, testDiagnostics.length);
});

it('should discover element definitions', async () => {
  const plugin = createDiscoverPlugin();

  const sourceFile = ts.createSourceFile(
    'test.ts',
    `
export const FooElement = defineElement({ tagName: 'mk-foo' });

const NoopElement = defineElement();
export const NoopElement2 = defineElement();
export const NoopElement3 = defineElement({});
export const NoopElement4 = defineElement({
  tagName: 0
});

export const BarElement = defineElement({ tagName: 'mk-bar' });
  `,
    ts.ScriptTarget.ESNext,
    true,
  );

  const definitions = (await plugin.discover!(sourceFile))!;
  expect(definitions).toHaveLength(2);
  expect(definitions[0].name).toBe('FooElement');
  expect(definitions[0].tagName.name).toBe('mk-foo');
  expect(definitions[1].name).toBe('BarElement');
  expect(definitions[1].tagName.name).toBe('mk-bar');
  expect(testDiagnostics).toHaveLength(3);
});
