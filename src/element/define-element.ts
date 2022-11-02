import { observable } from '@maverick-js/observables';

import { setContextMap, type SubjectRecord } from '../runtime';
import { isMaverickElement } from './create-html-element';
import { setHost } from './internal';
import type {
  ElementCSSVarRecord,
  ElementDeclaration,
  ElementDefinition,
  ElementEventRecord,
  ElementMembers,
  ElementPropDefinitions,
  ElementPropRecord,
  MaverickElement,
} from './types';

export function defineElement<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord,
  CSSVars extends ElementCSSVarRecord,
  Members extends ElementMembers,
>(
  declaration: ElementDeclaration<Props, Events, CSSVars, Members>,
): ElementDefinition<Props, Events, CSSVars, Members> {
  const definition: ElementDefinition<Props, Events, CSSVars, Members> = {
    ...declaration,
    setup(context) {
      if (context.context) setContextMap(context.context);

      setHost(context.host);
      const setup = declaration.setup?.(context) ?? { $render: () => null };
      setHost(null);

      return ((setup as Members)?.$render ? setup : { $render: setup }) as Members;
    },
    is: __SERVER__
      ? (node): node is never => false
      : (node): node is MaverickElement<Props> & Members =>
          isMaverickElement(node) && node.localName === definition.tagName,
  };

  return definition;
}

export function setupElementProps<Props extends ElementPropRecord>(
  propDefs?: ElementPropDefinitions<Props>,
) {
  const $$props = {} as SubjectRecord<Props>;
  const $$setupProps = {} as Props;

  if (propDefs) {
    for (const propName of Object.keys(propDefs) as (keyof Props)[]) {
      const def = propDefs![propName];
      const $prop = observable(def.initial, def);

      $$props[propName] = $prop;

      Object.defineProperty($$setupProps, propName, {
        enumerable: true,
        get() {
          return $prop();
        },
      });
    }
  }

  return { $$props, $$setupProps };
}
