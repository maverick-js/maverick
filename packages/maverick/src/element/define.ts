import { isFunction } from '../std/unit';
import { isHostElement } from './create-html-element';
import type {
  ElementCSSVarRecord,
  ElementDeclaration,
  ElementDefinition,
  ElementEventRecord,
  ElementMembers,
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
    setup(instance) {
      const setup = declaration.setup?.(instance) ?? {};
      return (isFunction(setup) ? { $render: setup } : setup) as Members;
    },
    is: __SERVER__
      ? (node): node is never => false
      : (node): node is MaverickElement<Props, Events> & Members =>
          isHostElement(node) && node.localName === definition.tagName,
  };

  return definition;
}
