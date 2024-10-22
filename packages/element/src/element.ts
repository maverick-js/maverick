import type {
  AnyComponent,
  Component,
  InferComponentEvents,
  InferComponentMembers,
  MaverickCustomElement,
} from '@maverick-js/core';

export interface MaverickElementConstructor<T extends Component = AnyComponent> {
  readonly tagName: string;
  readonly observedAttributes: string[];
  new (): MaverickElement<T>;
}

export type MaverickElement<T extends Component = AnyComponent, E = InferComponentEvents<T>> = Omit<
  MaverickCustomElement<T>,
  'addEventListener' | 'removeEventListener'
> &
  InferComponentMembers<T> & {
    addEventListener<K extends keyof E>(
      type: K,
      listener: (this: HTMLElement, ev: E[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof E>(
      type: K,
      listener: (this: HTMLElement, ev: E[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(
      type: K,
      listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void;
  };

export type InferMaverickElementComponent<T> =
  T extends MaverickElement<infer Component> ? Component : never;
