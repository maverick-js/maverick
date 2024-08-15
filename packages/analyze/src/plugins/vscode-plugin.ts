import { dirname } from 'pathe';

import { camelToKebabCase, escapeQuotes } from '../../utils/str';
import { isUndefined } from '../../utils/unit';
import type { ComponentMeta, PropMeta } from '../meta/component';
import type { CustomElementMeta } from '../meta/custom-element';
import { resolveConfigPaths } from '../utils/resolve';
import type { AnalyzePluginBuilder } from './analyze-plugin';

export interface VSCodePluginConfig extends Record<string, unknown> {
  cwd: string;
  outFile: string;
  transformTagData?: (
    meta: { element: CustomElementMeta; component?: ComponentMeta },
    data: ITagData,
  ) => ITagData;
  transformAttributeData?: (prop: PropMeta, data: IAttributeData) => IAttributeData;
  transformOutput?: (output: HTMLDataV1) => void;
}

const DEFAULT_CONFIG: VSCodePluginConfig = {
  cwd: process.cwd(),
  outFile: './vscode.html-data.json',
};

const primitiveTypeRE = /undefined|null|string|boolean|number|any|unknown|never/;

/**
 * Transforms component metadata into [VSCode Custom Data](https://github.com/microsoft/vscode-custom-data).
 * This will run in the `transform` plugin lifecycle step.
 */
export const createVSCodePlugin: AnalyzePluginBuilder<Partial<VSCodePluginConfig>> = (
  config = {},
) => ({
  name: 'maverick/vscode-html-data',

  async transform({ components, customElements }) {
    const normalizedConfig = await normalizeVSCodePluginConfig(config);

    const output: HTMLDataV1 = {
      version: 1.1,
      tags: [],
    };

    const map = new Map<CustomElementMeta, ComponentMeta | undefined>();
    for (const el of customElements) {
      if (!el.component) continue;
      const component = components.find((c) => c.name === el.component!.name);
      map.set(el, component);
    }

    customElements
      .filter((el) => !isUndefined(el.tag) && map.has(el))
      .forEach((element) => {
        const component = map.get(element)!;

        const tagData: ITagData = {
          name: element.tag!.name,
          description: element.docs || component?.docs,
          attributes: (component?.props ?? [])
            .filter((prop) => {
              const attr = element.attrs?.[prop.name]?.attr;
              return attr !== false && !prop.readonly && !prop.internal;
            })
            .map((prop) => {
              const attr = element.attrs?.[prop.name]?.attr;

              const data: IAttributeData = {
                name: attr || camelToKebabCase(prop.name),
                description: prop.docs,
                values: prop.type.full.includes('|')
                  ? prop.type.full
                      .split(/\s+\|\s+/)
                      ?.filter((value) => !primitiveTypeRE.test(value))
                      .map((type) => ({ name: escapeQuotes(type) }))
                  : undefined,
              };

              return config.transformAttributeData?.(prop, data) ?? data;
            }),
        };

        output.tags?.push(config.transformTagData?.({ element, component }, tagData) ?? tagData);
      });

    const dir = dirname(normalizedConfig.outFile);

    const { existsSync, mkdirSync, writeFileSync } = await import('node:fs');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    writeFileSync(
      normalizedConfig.outFile,
      JSON.stringify(config.transformOutput?.(output) ?? output, undefined, 2),
    );
  },
});

async function normalizeVSCodePluginConfig(
  config: Partial<VSCodePluginConfig>,
): Promise<VSCodePluginConfig> {
  return resolveConfigPaths(config.cwd ?? DEFAULT_CONFIG.cwd, {
    ...DEFAULT_CONFIG,
    ...config,
  });
}

/**
 * https://github.com/microsoft/vscode-html-languageservice/blob/master/src/htmlLanguageTypes.ts#L164
 */

export interface IReference {
  name: string;
  url: string;
}

export interface ITagData {
  name: string;
  description?: string;
  attributes: IAttributeData[];
  references?: IReference[];
}

export interface IAttributeData {
  name: string;
  description?: string;
  valueSet?: string;
  values?: IValueData[];
  references?: IReference[];
}

export interface IValueData {
  name: string;
  description?: string;
  references?: IReference[];
}

export interface IValueSet {
  name: string;
  values: IValueData[];
}

export interface HTMLDataV1 {
  version: 1 | 1.1;
  tags: ITagData[];
  globalAttributes?: IAttributeData[];
  valueSets?: IValueSet[];
}
