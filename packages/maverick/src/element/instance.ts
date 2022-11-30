import { getScheduler, observable, peek, root, scope } from '@maverick-js/observables';
import type { Writable } from 'type-fest';

import { createScopedRunner, provideContextMap, useContextMap } from '../runtime';
import { DOMEvent } from '../std/event';
import { runAll } from '../std/fn';
import { noop } from '../std/unit';
import {
  AFTER_UPDATE,
  ATTACH,
  BEFORE_UPDATE,
  CONNECT,
  DESTROY,
  DISCONNECT,
  LIFECYCLES,
  MEMBERS,
  MOUNT,
  PROPS,
  RENDER,
  setElementInstance,
} from './internal';
import type {
  AnyElementInstance,
  AnyMaverickElement,
  ElementDefinition,
  ElementInstance,
  ElementInstanceInit,
  ElementPropDefinitions,
  ElementPropRecord,
  InferElementEvents,
  InferElementProps,
} from './types';

export function createElementInstance<Element extends AnyMaverickElement>(
  definition: ElementDefinition<Element>,
  init: ElementInstanceInit<InferElementProps<Element>> = {},
): ElementInstance<InferElementProps<Element>, InferElementEvents<Element>> {
  type Props = InferElementProps<Element>;

  return root((dispose) => {
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

    const $connected = observable(false);
    const $mounted = observable(false);
    const $children = init.children ?? observable(false);

    const host: AnyElementInstance['host'] = {
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

    const instance: Writable<AnyElementInstance> = {
      host,
      props: new Proxy($$props, {
        set: __DEV__
          ? (_, prop) => {
              throw Error(`[maverick] attempting to set readonly prop \`${String(prop)}\``);
            }
          : (noop as any),
      }),
      [PROPS]: $$props,
      [ATTACH]: [],
      [CONNECT]: [],
      [MOUNT]: [],
      [BEFORE_UPDATE]: [],
      [AFTER_UPDATE]: [],
      [DISCONNECT]: [],
      [DESTROY]: [],
      accessors: () => $$props,
      dispatch(type, ..._init) {
        if (__DEV__ && !host.el) {
          console.warn(
            `[maverick] attempted to dispatch event \`${
              type as string
            }\` before attaching to host element`,
          );
        }

        const init = _init[0];
        return host.el
          ? host.el!.dispatchEvent(
              new DOMEvent(
                type as string,
                typeof init === 'object' && 'detail' in init ? init : { detail: init },
              ),
            )
          : false;
      },
      destroy() {
        if (destroyed) return;

        if (!__SERVER__) {
          $connected.set(false);
          runAll(instance[DISCONNECT]);
          $mounted.set(false);
          runAll(instance[DESTROY]);
          getScheduler().flushSync();
          for (const type of LIFECYCLES) instance[type] = [];
          dispose();
        } else {
          instance[ATTACH] = [];
          dispose();
        }

        instance[MEMBERS] = undefined;
        instance[RENDER] = undefined;

        host.el = null;
        destroyed = true;
      },
      run: createScopedRunner(),
    };

    setElementInstance(instance);
    instance[MEMBERS] = definition.setup(instance);
    setElementInstance(null);

    const $render = instance[MEMBERS]!.$render;
    if ($render) {
      const render = root(() => {
        // Create a new root context map to prevent children from overwriting flat context tree.
        provideContextMap(new Map(useContextMap()));
        return scope($render);
      }) as () => any;

      instance[RENDER] = () => {
        setElementInstance(instance);
        const result = peek(render);
        setElementInstance(null);
        return result;
      };
    }

    return instance;
  });
}

function createInstanceProps<Props extends ElementPropRecord>(
  propDefs: ElementPropDefinitions<Props>,
) {
  const props = {} as Props;

  for (const propName of Object.keys(propDefs) as (keyof Props)[]) {
    const def = propDefs![propName];
    const $prop = observable((def as any).initial, def);
    Object.defineProperty(props, propName, {
      enumerable: true,
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
