import {
  type ComponentConstructor,
  CUSTOM_ELEMENT_SYMBOL,
  getSlots,
  type HostProps,
  type JSX,
} from '@maverick-js/core';
import { setAttribute, unwrapDeep } from '@maverick-js/std';

import { ServerElement } from '../element/server-element';
import { $$_current_class_component } from '../runtime';

export interface HostComponentAttrs {
  class?: string;
  $class?: Record<string, JSX.ClassValue>;
  $var?: Record<string, JSX.CSSValue>;
}

export function Host(attrs: HostProps) {
  const ctor = $$_current_class_component?.constructor as ComponentConstructor | undefined;

  if (!$$_current_class_component) {
    throw Error(
      `[maverick]: <Host> can only be called at the top of a class component render function [@\`${ctor?.name}\`]`,
    );
  }

  if (!ctor?.element) {
    throw Error(
      `[maverick]: \`static element: CustomElementOptions\` must be provided on class component when using <Host> [@${ctor?.name}]`,
    );
  }

  const isCustomElement = CUSTOM_ELEMENT_SYMBOL in ctor,
    tagName = isCustomElement ? ctor.element.name : ctor.element.defaultTag,
    $$host = new ServerElement(tagName, $$_current_class_component),
    slots = getSlots();

  for (const attr of Object.keys(attrs)) {
    const value = unwrapDeep(attrs[attr]);
    setAttribute($$host as unknown as HTMLElement, attr, value);
  }

  $$_current_class_component.$$.attach($$host as unknown as HTMLElement);

  return `<!$><${tagName}>${slots.default?.() ?? ''}</${tagName}`;
}
