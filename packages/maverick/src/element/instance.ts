import { getScope, onDispose, root, scoped, signal, tick } from '@maverick-js/signals';
import type { Writable } from 'type-fest';

import { createAccessors, type WriteSignals } from '../runtime';
import {
  ATTACH,
  CONNECT,
  MEMBERS,
  PROPS,
  RENDER,
  SCOPE,
  setCustomElementInstance,
} from './internal';
import type {
  AnyCustomElement,
  CustomElementDefinition,
  CustomElementHost,
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
    if (init.scope) init.scope.append(getScope()!);

    let accessors: Props | null = null,
      destroyed = false,
      hasProps = 'props' in definition,
      $props = hasProps ? createInstanceProps(definition.props) : {},
      $connected = signal(false),
      $attrs = {},
      $styles = {},
      setAttributes = (attrs) => void Object.assign($attrs, attrs),
      setStyles = (styles) => void Object.assign($styles, styles);

    if (init.props && hasProps) {
      for (const prop of Object.keys(init.props)) {
        if (prop in definition.props) $props['$' + prop].set(init.props[prop]!);
      }
    }

    const host: CustomElementInstance['host'] = {
      [PROPS]: {
        $attrs,
        $styles,
        $connected,
      },
      el: null,
      $el() {
        return $connected() ? host.el : null;
      },
      $connected,
      setAttributes,
      setStyles,
      setCSSVars: setStyles,
    };

    const instance: Writable<CustomElementInstance> = {
      host,
      props: $props,
      [SCOPE]: getScope()!,
      [PROPS]: $props,
      [ATTACH]: [],
      [CONNECT]: [],
      accessors() {
        if (accessors) return accessors;
        const props = {};
        for (const prop of Object.keys(definition.props)) props[prop] = $props['$' + prop];
        return (accessors = createAccessors(props) as Props);
      },
      destroy() {
        if (destroyed) return;
        destroyed = true;
        host.el?.destroy();
        if (!__SERVER__) tick();
        instance[ATTACH].length = 0;
        instance[CONNECT].length = 0;
        dispose();
        instance[SCOPE] = null;
        instance[MEMBERS] = null;
        instance[RENDER] = null;
        (host as Writable<CustomElementHost>).el = null;
      },
    };

    try {
      setCustomElementInstance(instance);
      instance[MEMBERS] = definition.setup(instance);
    } finally {
      setCustomElementInstance(null);
    }

    const $render = instance[MEMBERS]?.$render;
    if ($render) {
      instance[RENDER] = function render() {
        let result = null;

        scoped(() => {
          try {
            setCustomElementInstance(instance);
            result = $render();
          } finally {
            setCustomElementInstance(null);
          }
        }, instance[SCOPE]);

        return result;
      };
    }

    onDispose(instance.destroy);
    return instance as CustomElementInstance<T>;
  });
}

function createInstanceProps<Props>(propDefs: CustomElementPropDefinitions<Props>) {
  const props = {} as WriteSignals<Props>;

  for (const name of Object.keys(propDefs) as (keyof Props)[]) {
    const def = propDefs![name];
    props['$' + (name as string)] = signal((def as any).initial, def);
  }

  return props;
}
