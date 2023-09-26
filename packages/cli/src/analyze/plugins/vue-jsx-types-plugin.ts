import { writeFileSync } from 'node:fs';

import { uniqueOnly } from '../../utils/array';
import { kebabToPascalCase } from '../../utils/str';
import type { AnalyzePlugin } from './analyze-plugin';

export interface VueJSXPluginConfig {
  /**
   * The types output file name.
   *
   * @defaultValue vue.d.ts
   */
  file?: string;
  /**
   * Additional custom import statements.
   */
  imports?: string[];
  /**
   * Additional global Vue components.
   */
  components?: string[];
}

/**
 * Generates Vue JSX types for all Custom Elements.
 */
export function vueJSXTypesPlugin({
  file = 'vue.d.ts',
  imports = [],
  components: userComponents = [],
}: VueJSXPluginConfig = {}): AnalyzePlugin {
  return {
    name: 'maverick/vue-jsx-types',
    async transform({ components, customElements }) {
      const elementImports = customElements.map((el) => el.name),
        typeImports = customElements
          .map((el) => el.component?.name && components.find((c) => c.name === el.component!.name))
          .flatMap((c) => (c ? [c.generics?.props, c.generics?.events].filter(Boolean) : [])),
        globalComponents = customElements.map(
          (el) => `"${el.tag.name}": ${el.name.replace('Element', '') + 'Component'}`,
        );

      const dts = [
        "import type { HTMLAttributes, Ref, ReservedProps } from 'vue';",
        `import type { ${elementImports.join(', ')} } from './elements';`,
        `import type { ${uniqueOnly(typeImports).join(', ')} } from './index';`,
        ...imports,
        '',
        "declare module 'vue' {",
        '  export interface GlobalComponents {',
        `    ${[...globalComponents, ...userComponents].join(';\n    ')}`,
        '  }',
        '}',
        '',
        'export type ElementRef<T> = string | Ref<T> | ((el: T | null) => void);',
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
              `Omit<HTMLAttributes, ${omitHTMLAttrs}>`,
              "Omit<ReservedProps, 'ref'>",
            ].filter(Boolean);
          return [
            '/**********************************************************************************************',
            `* ${name}`,
            '/**********************************************************************************************/',
            '',
            `export interface ${name}Component {`,
            `  (props: ${attrsName}): ${el.name};`,
            '}',
            '',
            `export interface ${attrsName} extends ${_extends.join(', ')} {`,
            `  ref?: ElementRef<${el.name}>;`,
            '}',
            '',
            ...(hasEvents
              ? [
                  `export interface ${eventsAttrsName} {`,
                  component
                    .events!.map(
                      (event) =>
                        `  on${kebabToPascalCase(event.name)}?: EventHandler<${eventsType}['${
                          event.name
                        }']>;`,
                    )
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
