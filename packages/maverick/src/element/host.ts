import type { Dispose } from '@maverick-js/signals';

import type { AnyComponent, Component, InferComponentState } from '../core/component';
import type { LifecycleCallback } from '../core/instance';
import type { InferStore, Store } from '../core/store';
import type { COMPONENT, SETUP } from './symbols';

export interface HostElement<T extends Component = AnyComponent> {
  /**
   * Whether this component should be kept-alive on DOM disconnection. If `true`, all child
   * host elements will also be kept alive and the instance will need to be manually destroyed.
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

  /** @internal type only */
  ts__component?: T;

  /** @internal */
  readonly [COMPONENT]: T;

  /** @internal */
  readonly $state: Store<InferComponentState<T>>;

  /** @internal */
  [SETUP](): void;

  /** @deprecated */
  onAttach(callback: LifecycleCallback): Dispose;

  /**
   * Destroys the underlying component instance.
   */
  destroy(): void;
}
