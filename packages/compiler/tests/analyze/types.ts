import type { HTMLCustomElement } from '../../../maverick/src/element';
import type { DOMEvent } from '../../../maverick/src/std';

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
   * @defaultValue 1
   */
  foo: 0 | 1;
  bar: string;
  readonly baz: Bar;
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

interface BarElement extends HTMLCustomElement<FooProps & BaxProps, FooEvents, FooCSSVars> {}

/**
 * This is the `FooElement` documentation.
 *
 * @slot This is the default slot.
 * @slot foo - This is the foo slot.
 * @csspart foo - This is the foo CSS Part.
 * @csspart bar - This is the bar CSS Part.
 */
export interface FooElement extends BarElement {
  foo: number;
  bar: Bar;
  /**
   * This is the baz docs.
   */
  readonly baz: boolean;
  boo: { a: number; b: string; c: string };
  start(): void;
  /**
   * The stop method docs.
   */
  stop(fooArg: number, barArg: Bar): Promise<void>;
  /** The resume method docs. */
  resume<T>(foo: T): T;
}
