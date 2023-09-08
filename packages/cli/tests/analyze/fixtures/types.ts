import { Component, State, method, prop, } from '../../../../maverick/src/core';
import type { DOMEvent } from '../../../../maverick/src/std';

interface MooProps<T> {
  /** This is the moo docs. */
  moo: T;
  /**
   * This is the moo boo docs.
   *
   * @footag
   */
  mooBoo: 0 | 1;
  mooHux: boolean;
}

type FooProps = Pick<MooProps<string>, 'moo' | 'mooBoo'> & {
  /**
   * This is the foo prop docs.
   */
  foo: number;
  bar: number;
  lux: number;
  box: number | undefined;
  /**
   * This is the bax hux docs.
   *
   * @internal
   * @deprecated
   */
  baxHux: Bar;
  /** @defaultValue null */
  huxBux: string | null;
  zoo: number | undefined;
} & {
  /**
   * This is the bam docs.
   *
   * @example
   * ```ts
   * const bam = 1;
   * ```
   */
  bam: string;
  show: () => string;
};

interface BaseEvent extends DOMEvent<boolean> {}
interface FooEvent extends BaseEvent {}

/**
 * This is the `Baz` event docs.
 *
 * @internal
 */
type BazEvent = DOMEvent<0 | 1>;

interface FooEvents extends BarEvents {
  /**
   * This is the foo event.
   *
   * @bubbles
   */
  foo: FooEvent;
  bar: DOMEvent<void>;
}

type BarEvents = {
  baz: BazEvent;
  boo: DOMEvent<string | null>;
} & {
  /***
   * This is the lux event.
   *
   * @composed
   * @deprecated
   */
  lux: DOMEvent<string | null>;
  hux: DOMEvent<number | null>;
} & BazEvents;

type FooBoo = 'a' | 'b' | 'c';

type BazEvents = {
  'bax-hux': DOMEvent<0 | 1 | 2 | 3>;
  'baz-boo': DOMEvent<FooBoo>;
};

interface FooCSSVars {
  /**
   * This is the foo docs.
   *
   * @default 1
   */
  foo: 0 | 1;
  bar: string;
  readonly baz: Bar;
  /** @defaultValue 1 */
  readonly bax?: number;
}

type Bar = string | null;

interface LuxProps {
  jux: string;
  /**
   * This is the loo prop docs.
   */
  loo: number;
}

interface BaxProps extends Pick<LuxProps, 'loo'> {
  jax: number;
}

interface FooState {
  readonly foo: number;
  /**
   * This is the baz state docs.
   *
   * @tag test
   */
  baz: string | number;
  boom: string;
}

const state = new State<FooState>({
  get foo() {
    return this.baz + 10;
  },
  baz: 20,
  get boom() {
    return this.foo + '';
  },
})

export class BaseComponent extends Component<
  FooProps & BaxProps,
  FooState,
  FooEvents,
  FooCSSVars
> {
  static props = {
    baxHux: 30,
    huxBux: '',
  };

  static state = state;

  @prop
  get baseGetter() {
    return 10;
  }

  // ...

  /** These should be ignored */
  override onSetup() {}
  override onAttach() {}
  override onConnect() {}
  override onDestroy() {}

  override destroy() {}

  /** This is a base method. */
  @method
  baseMethod() {}
}
