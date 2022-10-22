import { observable, peek } from '@maverick-js/observables';
import { type JSX, setContextMap } from '../runtime';
import { isFunction } from '../utils/unit';
import { setHostElement } from './internal';
import type {
  ElementDeclaration,
  ElementDefinition,
  ElementMembers,
  ElementPropDefinitions,
  ElementProps,
  ObservableElementProps,
} from './types';

const registry = new Map<string, ElementDefinition>();

export function getElementDefinition(tagName: string) {
  return registry.get(tagName);
}

export function defineElement<
  Props extends ElementProps,
  Events = JSX.GlobalOnAttributes,
  Members extends ElementMembers = ElementMembers,
>(
  declaration: ElementDeclaration<Props, Events, Members>,
): ElementDefinition<Props, Events, Members> {
  const definition = {
    ...declaration,
    setup(context) {
      if (context.context) setContextMap(context.context);

      setHostElement(context.host);
      const setup = declaration.setup(context);
      setHostElement(null);

      const members = (isFunction(setup) ? { $render: setup } : setup) as Members;

      const render = members.$render;
      // @ts-expect-error - override readonly
      members.$render = () =>
        peek(() => {
          setHostElement(context.host);
          const result = render();
          setHostElement(null);
          return result;
        });

      return members;
    },
  };

  registry.set(definition.tagName, definition);
  return definition;
}

export function createSetupProps<Props extends ElementProps>(
  propDefs: ElementPropDefinitions<Props>,
  init?: ObservableElementProps<Props>,
) {
  const $props = {} as ObservableElementProps<Props>;
  const $setupProps = {} as Props;

  for (const propName of Object.keys(propDefs) as (keyof Props)[]) {
    const def = propDefs![propName];
    const $prop = init?.[propName] ?? observable(def.initialValue, def);

    // @ts-expect-error - override readonly
    $props[propName] = $prop;

    Object.defineProperty($setupProps, propName, {
      enumerable: true,
      get() {
        return $prop();
      },
    });
  }

  return { $props, $setupProps };
}
