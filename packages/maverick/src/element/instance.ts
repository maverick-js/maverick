import { getScope, root, SCOPE, Scope, scoped, signal, tick } from '@maverick-js/signals';
import type { Writable } from 'type-fest';

import { provideContextMap, useContextMap } from '../runtime';
import { noop } from '../std/unit';
import {
  ATTACH,
  CONNECT,
  DESTROY,
  LIFECYCLES,
  MEMBERS,
  MOUNT,
  PROPS,
  RENDER,
  setCustomElementInstance,
} from './internal';
import type {
  AnyCustomElement,
  AnyCustomElementInstance,
  CustomElementDefinition,
  CustomElementInstance,
  CustomElementInstanceInit,
  CustomElementPropDefinitions,
  InferCustomElementProps,
} from './types';

export function createElementInstance<T extends AnyCustomElement>(
  definition: CustomElementDefinition<T>,
  init: CustomElementInstanceInit<InferCustomElementProps<T>> = {},
): CustomElementInstance<T> {
  type Props = InferCustomElementProps<T>;

  return root((dispose) => {
    if (init.scope) getScope()![SCOPE] = init.scope;
    if (init.context) provideContextMap(init.context);

    let destroyed = false,
      $$props = 'props' in definition ? createInstanceProps(definition.props) : ({} as Props);

    if (init.props && 'props' in definition) {
      for (const prop of Object.keys(init.props)) {
        if (prop in definition.props) {
          $$props[prop as keyof Props] = init.props[prop]!;
        }
      }
    }

    const $connected = signal(false);
    const $mounted = signal(false);
    const $children = init.children ?? signal(false);

    const host: AnyCustomElementInstance['host'] = {
      el: null,
      get $connected() {
        return $connected();
      },
      get $mounted() {
        return $mounted();
      },
      get $children() {
        return $children();
      },
      [PROPS]: {
        $connected,
        $mounted,
        $children,
      },
    };

    const instance: Writable<AnyCustomElementInstance> = {
      host,
      props: new Proxy($$props as object, {
        set: __DEV__
          ? (_, prop) => {
              throw Error(`[maverick] attempting to set readonly prop \`${String(prop)}\``);
            }
          : (noop as any),
      }),
      [SCOPE]: getScope()!,
      [PROPS]: $$props,
      [ATTACH]: [],
      [CONNECT]: [],
      [MOUNT]: [],
      [DESTROY]: [],
      accessors: () => $$props,
      destroy() {
        if (destroyed) return;

        if (!__SERVER__) {
          $connected.set(false);
          $mounted.set(false);
          tick();

          for (const destroyCallback of instance[DESTROY]) {
            scoped(destroyCallback, instance[SCOPE]);
          }

          tick();

          for (const type of LIFECYCLES) instance[type].length = 0;
          dispose();
        } else {
          instance[ATTACH].length = 0;
          dispose();
        }

        instance[SCOPE] = null;
        instance[MEMBERS] = undefined;
        instance[RENDER] = undefined;

        host.el = null;
        destroyed = true;
      },
    };

    setCustomElementInstance(instance);
    instance[MEMBERS] = definition.setup(instance);
    setCustomElementInstance(null);

    const $render = instance[MEMBERS]!.$render;
    if ($render) {
      let scope!: Scope;

      // Create a new root context to prevent children from overwriting flat context tree.
      root(() => {
        provideContextMap(new Map(useContextMap()));
        scope = getScope()!;
      });

      instance[RENDER] = function render() {
        let result = null;

        scoped(() => {
          setCustomElementInstance(instance);
          result = $render();
          setCustomElementInstance(null);
        }, scope);

        return result;
      };
    }

    return instance as CustomElementInstance<T>;
  });
}

function createInstanceProps<Props>(propDefs: CustomElementPropDefinitions<Props>) {
  const props = {} as Props;

  for (const propName of Object.keys(propDefs) as (keyof Props)[]) {
    const def = propDefs![propName];
    const $prop = signal((def as any).initial, def);
    Object.defineProperty(props, propName, {
      enumerable: true,
      configurable: true,
      get() {
        return $prop();
      },
      set(value) {
        $prop.set(value);
      },
    });
  }

  return props;
}
