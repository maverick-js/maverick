import type { Dispose, Maybe, Scope } from '@maverick-js/signals';

import type {
  AnyMaverickComponent,
  InferComponentProps,
  InferComponentState,
  MaverickComponent,
} from '../component';
import type { Store } from '../state';
import type { ReadSignalRecord } from '../types';
import type { Attributes } from './attrs';

export interface MaverickCustomElement<T extends MaverickComponent = AnyMaverickComponent>
  extends HTMLElement {
  /**
   * Whether this component should be kept-alive on DOM disconnection. If `true`, all child
   * host elements will also be kept alive and the instance will need to be manually destroyed. Do
   * note, this can be prevented by setting `forwardKeepAlive` to ``false`.
   *
   * Important to note that if a parent element is kept alive, calling destroy will also destroy
   * all child element instances.
   *
   * ```ts
   * // Destroy this component and all children.
   * element.destroy();
   * ```
   */
  keepAlive: boolean;

  /**
   * If this is `false`, children will _not_ adopt the `keepAlive` state of this element.
   *
   * @defaultValue true
   */
  forwardKeepAlive: boolean;

  /** Component instance. */
  readonly $: T;

  readonly scope: Scope;
  readonly attachScope: Scope | null;
  readonly connectScope: Scope | null;

  /** @internal */
  readonly $props: ReadSignalRecord<InferComponentProps<T>>;

  /** @internal */
  readonly $state: Store<InferComponentState<T>>;

  /**
   * This object contains the state of the component.
   *
   * ```ts
   * const el = document.querySelector('foo-el');
   * el.state.foo;
   * ```
   */
  readonly state: InferComponentState<T> extends Record<string, never>
    ? never
    : Readonly<InferComponentState<T>>;

  /**
   * Enables subscribing to live updates of component state.
   *
   * @example
   * ```ts
   * const el = document.querySelector('foo-el');
   * el.subscribe(({ foo, bar }) => {
   *   // Re-run when the value of foo or bar changes.
   * });
   * ```
   */
  subscribe: InferComponentState<T> extends Record<string, never>
    ? never
    : (callback: (state: Readonly<InferComponentState<T>>) => Maybe<Dispose>) => Dispose;

  /**
   * Destroy the underlying component instance.
   */
  destroy(): void;
}

export interface MaverickCustomElementConstructor<
  T extends MaverickComponent = AnyMaverickComponent,
> {
  new (): MaverickCustomElement<T>;
}

export interface CustomElementOptions<Props = {}> {
  readonly name: string;
  readonly attrs?: Attributes<Props>;
}
