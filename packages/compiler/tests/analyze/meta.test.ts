import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path, { resolve } from 'node:path';

import { TS_NODE } from 'maverick.js/analyze/meta/component';
import { createBuildPlugin } from 'maverick.js/analyze/plugins/build-plugin';
import { createDiscoverPlugin } from 'maverick.js/analyze/plugins/discover-plugin';
import { compileOnce } from 'maverick.js/cli/compile';
import { testDiagnostics } from 'maverick.js/utils/logger';

afterEach(() => {
  testDiagnostics.splice(0, testDiagnostics.length);
});

const replacer = (key, value) => (key !== TS_NODE ? value : undefined);

it('should build component meta', async () => {
  const meta = await buildMeta();
  const output = resolve(__dirname, './meta.json');
  const current = JSON.stringify(meta, replacer, 2);
  const prev = existsSync(output) ? await readFile(output, 'utf-8') : null;
  if (!prev) {
    await writeFile(output, current);
  } else {
    expect(current, 'component meta does not match').toBe(prev);
  }
});

async function buildMeta() {
  const filename = path.resolve(__dirname, `./fixtures.ts`);
  const program = compileOnce([filename]);
  const discoverPlugin = createDiscoverPlugin();
  const buildPlugin = createBuildPlugin();
  const sourceFile = program.getSourceFile(filename)!;
  await discoverPlugin.init!(program);
  const definitions = await discoverPlugin.discover!(sourceFile);
  if (!definitions?.[0]) return null;
  await buildPlugin.init!(program);
  return Promise.all(definitions.map((def) => buildPlugin.build!(def)));
}
