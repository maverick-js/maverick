import { writeFileSync } from 'node:fs';

import { uniqueOnly } from '../../utils/array';
import type { AnalyzePlugin } from './analyze-plugin';

export interface SolidJSXPluginConfig {
  /**
   * The types output file name.
   *
   * @defaultValue solid.d.ts
   */
  file?: string;
  /**
   * Additional custom import statements.
   */
  imports?: string[];
  /**
   * Additional components.
   */
  components?: string[];
}

/**
 * Generates Solid JSX types for all Custom Elements.
 */
export function solidJSXTypesPlugin({
  file = 'solid.d.ts',
  imports = [],
  components: userComponents = [],
}: SolidJSXPluginConfig = {}): AnalyzePlugin {
  return {
    name: 'maverick/solid-jsx-types',
    async transform({ components, customElements }) {
      const elementImports = customElements.map((el) => el.name),
        typeImports = customElements
          .map((el) => el.component?.name && components.find((c) => c.name === el.component!.name))
          .flatMap((c) => (c ? [c.generics?.props, c.generics?.events].filter(Boolean) : [])),
        solidElements = customElements.map(
          (el) => `"${el.tag.name}": ${el.name.replace('Element', '') + 'Attributes'}`,
        );

      const dts = [
        "import type { JSX } from 'solid-js';",
        `import type { ${elementImports.join(', ')} } from './elements';`,
        `import type { ${uniqueOnly(typeImports).join(', ')} } from './index';`,
        ...imports,
        '',
        'declare module "solid-js"{',
        '  namespace JSX {',
        '    interface IntrinsicElements {',
        `      ${[...solidElements, ...userComponents].join(';\n    ')}`,
        '    }',
        '  }',
        '}',
        '',
        'export interface EventHandler<T> {',
        '  (event: T): void;',
        '}',
        ...customElements.map((el) => {
          const name = el.name.replace('Element', ''),
            component = components.find((c) => c.name === el.component?.name),
            propsType = component?.generics?.props,
            eventsType = component?.generics?.events,
            hasEvents = eventsType && component?.events?.length,
            attrsName = `${name}Attributes`,
            eventsAttrsName = `${name}EventAttributes`,
            omitHTMLAttrs = [
              propsType && `keyof ${propsType}`,
              hasEvents && `keyof ${eventsAttrsName}`,
              '"is"',
            ]
              .filter(Boolean)
              .join(' | '),
            _extends = [
              propsType && `Partial<${propsType}>`,
              hasEvents && eventsAttrsName,
              `Omit<JSX.HTMLAttributes<${el.name}>, ${omitHTMLAttrs}>`,
            ].filter(Boolean);
          return [
            '/**********************************************************************************************',
            `* ${name}`,
            '/**********************************************************************************************/',
            '',
            '',
            `export interface ${attrsName} extends ${_extends.join(', ')} {`,
            "  'keep-alive': boolean;",
            '}',
            '',
            ...(hasEvents
              ? [
                  `export interface ${eventsAttrsName} {`,
                  component
                    .events!.map((event) => {
                      const docs = event.docs
                        ? `/**\n${event.docs}\n${event.doctags
                            ?.map((tag) => `@${tag.name} ${tag.text}`)
                            .join('\n')}\n*/\n  `
                        : '';

                      return `  ${docs}"on:${event.name}"?: EventHandler<${eventsType}['${event.name}']>;`;
                    })
                    .join('\n'),
                  '}',
                ]
              : []),
            '',
          ].join('\n');
        }),
      ];

      writeFileSync(file, dts.join('\n'));
    },
  };
}
