import {
  parseClassAttr,
  parseStyleAttr,
  ServerAttributes,
  ServerClassList,
  ServerStyle,
} from '@maverick-js/ssr';
import { noop } from '@maverick-js/std';
import { type AnyComponent, scoped } from 'maverick.js';

import { SETUP_SYMBOL } from '../symbols';

export class MaverickServerElement<T extends AnyComponent = AnyComponent> implements ServerElement {
  keepAlive = false;
  forwardKeepAlive = true;

  readonly $: T;
  readonly attributes = new ServerAttributes();
  readonly style = new ServerStyle();
  readonly classList = new ServerClassList();

  get $props() {
    return this.$.$$.props;
  }

  get $state() {
    return this.$.$$.$state;
  }

  get state() {
    return this.$.state;
  }

  constructor(component: T) {
    this.$ = component;
  }

  setup() {
    const instance = this.$.$$;
    scoped(() => {
      if (this.hasAttribute('class')) {
        parseClassAttr(this.classList.tokens, this.getAttribute('class')!);
      }

      if (this.hasAttribute('style')) {
        parseStyleAttr(this.style.tokens, this.getAttribute('style')!);
      }

      instance.setup();
      instance.attach(this as unknown as HTMLElement);

      if (this.classList.length > 0) {
        this.setAttribute('class', this.classList.toString());
      }

      if (this.style.length > 0) {
        this.setAttribute('style', this.style.toString());
      }

      if (this.keepAlive) {
        this.setAttribute('keep-alive', '');
      }
    }, instance.scope);
  }

  getAttribute(name: string): string | null {
    return this.attributes.getAttribute(name);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.setAttribute(name, value);
  }

  hasAttribute(name: string): boolean {
    return this.attributes.hasAttribute(name);
  }

  removeAttribute(name: string): void {
    return this.attributes.removeAttribute(name);
  }

  [SETUP_SYMBOL]() {}
  addEventListener() {}
  removeEventListener() {}

  dispatchEvent() {
    return false;
  }

  subscribe() {
    return noop;
  }

  destroy() {
    this.$.destroy();
  }
}

export interface ServerElement
  extends Pick<
    HTMLElement,
    | 'getAttribute'
    | 'setAttribute'
    | 'hasAttribute'
    | 'removeAttribute'
    | 'dispatchEvent'
    | 'addEventListener'
    | 'removeEventListener'
  > {
  readonly classList: Pick<
    HTMLElement['classList'],
    'length' | 'add' | 'contains' | 'remove' | 'replace' | 'toggle' | 'toString'
  >;
  readonly style: Pick<
    HTMLElement['style'],
    'length' | 'getPropertyValue' | 'removeProperty' | 'setProperty'
  > & { toString(): string };
}
