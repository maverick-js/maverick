import { observable, peek } from '@maverick-js/observables';
import { type JSX, setContextMap } from '../runtime';
import { isFunction } from '../utils/unit';
import { setCurrentHostElement } from './internal';
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
    id: Symbol(declaration.tagName),
    setup(context) {
      if (context.context) setContextMap(context.context);

      setCurrentHostElement(context.host);
      const members = declaration.setup(context);
      setCurrentHostElement(null);

      const normalized = (isFunction(members) ? { $render: members } : members) as Members;

      return {
        ...normalized,
        $render: peek(() => {
          setCurrentHostElement(context.host);
          const result = normalized.$render();
          setCurrentHostElement(null);
          return result;
        }),
      };
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
    const $prop = init?.[propName] ?? observable(def.initialValue);

    // @ts-expect-error - override readonly
    $props[propName] = $prop;

    Object.defineProperty($setupProps, propName, {
      get() {
        return $prop();
      },
    });
  }

  return { $props, $setupProps };
}
