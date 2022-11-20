import { getScheduler, getScope, observable, peek, root, scope } from '@maverick-js/observables';
import type { Writable } from 'type-fest';

import { createScopedRunner, setContextMap, type SubjectRecord } from '../runtime';
import { DOMEvent } from '../std/event';
import { runAll } from '../std/fn';
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
  ElementDefinition,
  ElementEventRecord,
  ElementInstance,
  ElementInstanceInit,
  ElementPropDefinitions,
  ElementPropRecord,
} from './types';

export function createElementInstance<
  Props extends ElementPropRecord,
  Events extends ElementEventRecord = ElementEventRecord,
>(
  definition: ElementDefinition<Props, Events, any, any>,
  init: ElementInstanceInit<Props> = {},
): ElementInstance<Props, Events> {
  return root((dispose) => {
    if (init.context) setContextMap(init.context);

    let destroyed = false;
    let { props, $$props } = createInstanceProps(definition.props ?? ({} as Props));

    if (init.props) {
      for (const prop of Object.keys(init.props)) {
        $$props[prop]?.set(init.props[prop]!);
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
      props,
      [PROPS]: $$props,
      [ATTACH]: [],
      [CONNECT]: [],
      [MOUNT]: [],
      [BEFORE_UPDATE]: [],
      [AFTER_UPDATE]: [],
      [DISCONNECT]: [],
      [DESTROY]: [],
      dispatch(type, init) {
        if (__DEV__ && !host.el) {
          console.warn(
            `[maverick] attempted to dispatch event \`${
              type as string
            }\` before attaching to host element`,
          );
        }

        return host.el
          ? host.el.dispatchEvent(
              new DOMEvent(type as string, {
                ...definition.events?.[type],
                ...(init && 'detail' in init ? init : { detail: init }),
              }),
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
    const render = $render ? scope($render) : () => null;
    instance[RENDER] = () => {
      setElementInstance(instance);
      const result = peek(render);
      setElementInstance(null);
      return result;
    };

    return instance;
  });
}

function createInstanceProps<Props extends ElementPropRecord>(
  propDefs: ElementPropDefinitions<Props>,
) {
  const props = {} as Props;
  const $$props = {} as SubjectRecord<Props>;

  for (const propName of Object.keys(propDefs) as (keyof Props)[]) {
    const def = propDefs![propName];
    const $prop = observable(def.initial, def);

    $$props[propName] = $prop;

    Object.defineProperty(props, propName, {
      enumerable: true,
      get() {
        return $prop();
      },
    });
  }

  return { props, $$props };
}
