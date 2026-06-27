import {
  $$_current_host_component,
  type AnyComponent,
  type ComponentConstructor,
  DEFINE_ELEMENT_SYMBOL,
  getSlots,
  type HostProps,
  type MaverickCustomElement,
} from '@maverick-js/core';
import { attachDeclarativeShadowDOM, attachShadow } from '@maverick-js/std';

import { insert } from '../insert';
import { hydrate, hydration } from '../render';
import { $$_attr, $$_next_element, $$_signal_name_re } from '../runtime';

export function Host(props: HostProps) {
  const ctor = $$_current_host_component?.constructor as ComponentConstructor | undefined;

  if (__DEV__ && !$$_current_host_component) {
    throw Error(
      `[maverick]: <Host> can only be called at the top of a class component render function [@${ctor?.name}]`,
    );
  }

  if (__DEV__ && !ctor?.element) {
    throw Error(
      `[maverick]: \`static element: CustomElementOptions\` must be provided on class component when using <Host> [@${ctor?.name}]`,
    );
  }

  if (!ctor) return null;

  const isCustomElement = DEFINE_ELEMENT_SYMBOL in ctor,
    host = createHostElement(ctor, isCustomElement)!,
    slots = getSlots();

  if (slots.default) {
    let target: Node = host,
      shadowRoot = ctor.element?.shadowRoot;

    if (shadowRoot) {
      if (hydration) attachDeclarativeShadowDOM(host);
      target = host.shadowRoot ?? attachShadow(host, shadowRoot);
    }

    if (hydration && shadowRoot) {
      hydrate(slots.default, { target });
    } else {
      insert(target, slots.default());
    }
  }

  for (const name of Object.keys(props)) {
    $$_attr(host, name.replace($$_signal_name_re, ''), props[name]);
  }

  $$_current_host_component!.$$.attach(host);

  window.requestAnimationFrame(connect.bind($$_current_host_component!));

  return host;
}

function connect(this: AnyComponent) {
  this.$$.connect();
}

function createHostElement(Component: ComponentConstructor, isCustomElement: boolean) {
  const options = Component.element;

  if (isCustomElement) {
    Component[DEFINE_ELEMENT_SYMBOL]!();

    if (hydration) {
      const el = $$_next_element<MaverickCustomElement>(hydration.w);

      if (!el.$) {
        // @ts-expect-error - override readonly
        el.$ = $$_current_host_component;
      }

      return el;
    } else {
      const el = document.createElement(options!.name);
      el.setAttribute('data-maverick', '');
      return el;
    }
  } else if (options) {
    return hydration
      ? $$_next_element<HTMLElement>(hydration.w)
      : (document.createElement(options.fallbackTag) as HTMLElement);
  }

  return null;
}
