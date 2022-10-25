import { observable, peek } from '@maverick-js/observables';
import { type JSX, setContextMap } from '../runtime';
import { isFunction } from '../utils/unit';
import { setHost } from './internal';
import type {
  ElementCSSVars,
  ElementDeclaration,
  ElementDefinition,
  ElementMembers,
  ElementPropDefinitions,
  ElementProps,
  ObservableElementProps,
} from './types';

export function defineElement<
  Props extends ElementProps = ElementProps,
  Events = JSX.GlobalOnAttributes,
  CSSVars extends ElementCSSVars = ElementCSSVars,
  Members extends ElementMembers = ElementMembers,
>(
  declaration: ElementDeclaration<Props, Events, Members>,
): ElementDefinition<Props, Events, CSSVars, Members> {
  const definition: ElementDefinition<Props, Events, CSSVars, Members> = {
    ...declaration,
    setup(context) {
      if (context.context) setContextMap(context.context);

      setHost(context.host);
      const setup = declaration.setup(context);
      setHost(null);

      const members = (isFunction(setup) ? { $render: setup } : setup) as Members;
      const render = members.$render;

      // @ts-expect-error - override readonly
      members.$render = () =>
        peek(() => {
          setHost(context.host);
          const result = render();
          setHost(null);
          return result;
        });

      return members;
    },
  };

  return definition;
}

export function setupElementProps<Props extends ElementProps>(
  propDefs?: ElementPropDefinitions<Props>,
) {
  const $$props = {} as ObservableElementProps<Props>;
  const $$setupProps = {} as Props;

  if (propDefs) {
    for (const propName of Object.keys(propDefs) as (keyof Props)[]) {
      const def = propDefs![propName];
      const $prop = observable(def.initialValue, def);

      // @ts-expect-error - override readonly
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
