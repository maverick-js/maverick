import { dirname } from 'pathe';

import type { ComponentMeta } from '../meta/component';
import type { CustomElementMeta } from '../meta/custom-element';
import type { ReactComponentMeta } from '../meta/react';
import { TS_NODE_SYMBOL } from '../meta/symbols';
import { resolveConfigPaths } from '../utils/resolve';
import type { AnalyzePluginBuilder } from './analyze-plugin';

export type JSONPluginOutput = Record<string, any> & {
  elements: CustomElementMeta[];
  components: ComponentMeta[];
  react: ReactComponentMeta[];
};

export interface JSONPluginConfig extends Record<string, unknown> {
  cwd: string;
  outFile: string;
  transformJson?: (output: JSONPluginOutput) => Record<string, any>;
  stringifyJson?: (
    output: JSONPluginOutput,
    defaultReplacer: (key: string, value: any) => any,
    space: number,
  ) => string;
}

const DEFAULT_CONFIG: JSONPluginConfig = {
  cwd: process.cwd(),
  outFile: './analyze.json',
};

const replacer = (key: string | symbol, value: any) => {
  return key !== TS_NODE_SYMBOL ? value : undefined;
};

/**
 * Transforms component metadata into JSON format. This will run in the `transform` plugin
 * lifecycle step.
 */
export const createJSONPlugin: AnalyzePluginBuilder<Partial<JSONPluginConfig>> = (config = {}) => ({
  name: 'maverick/json',

  async transform({ components, customElements, reactComponents }) {
    const normalizedConfig = await normalizeJSONPluginConfig(config);

    const output: JSONPluginOutput = {
      components,
      elements: customElements,
      react: reactComponents,
    };

    const stringify = config.stringifyJson ?? JSON.stringify;
    const finalOutput = normalizedConfig.transformJson?.(output) ?? output;

    const dir = dirname(normalizedConfig.outFile);

    const { existsSync, mkdirSync, writeFileSync } = await import('node:fs');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    writeFileSync(
      normalizedConfig.outFile,
      stringify(finalOutput as JSONPluginOutput, replacer, 2),
    );
  },
});

async function normalizeJSONPluginConfig(
  config: Partial<JSONPluginConfig>,
): Promise<JSONPluginConfig> {
  return resolveConfigPaths(config.cwd ?? DEFAULT_CONFIG.cwd, {
    ...DEFAULT_CONFIG,
    ...config,
  });
}
