import { dirname } from 'pathe';

import { type ComponentMeta, TS_NODE } from '../meta/component';
import { resolveConfigPaths } from '../utils/resolve';
import type { AnalyzePluginBuilder } from './AnalyzePlugin';

export type JSONPluginOutput = Record<string, any> & {
  components: ComponentMeta[];
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
  outFile: './elements.json',
};

const replacer = (key: string | symbol, value: any) => {
  return key !== TS_NODE ? value : undefined;
};

/**
 * Transforms component metadata into JSON format. This will run in the `transform` plugin
 * lifecycle step.
 */
export const createJSONPlugin: AnalyzePluginBuilder<Partial<JSONPluginConfig>> = (config = {}) => ({
  name: 'maverick/json',

  async transform(components, fs) {
    const normalizedConfig = await normalizeJSONPluginConfig(config);

    const output: JSONPluginOutput = {
      components: [],
    };

    components.forEach((component) => {
      output.components.push(component as any);
    });

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
