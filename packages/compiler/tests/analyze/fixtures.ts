// @ts-nocheck

type FooProps = {
  /** This is the foo prop docs. */
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

interface FooEvent extends DOMEvent<boolean> {}

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
  baz: Bar;
}

type Bar = string | null;

/**
 * This is the `FooElement` documentation.
 *
 * @slot This is the default slot.
 * @slot foo - This is the foo slot.
 * @csspart foo - This is the foo CSS Part.
 * @csspart bar - This is the bar CSS Part.
 */
interface FooElement extends MaverickElement<FooProps, FooEvents, FooCSSVars> {
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

const BAZ_CSS_VAR = 'baz';

export const FooElement = defineElement<FooElement>({
  tagName: 'mk-foo',
  shadowRoot: true,
  props: {
    foo: { initial: 0 },
    bar: { initial: 10, attribute: 'boo' },
    lux: { initial: 20, attribute: false },
    baxHux: { initial: 30, reflect: true },
    huxBux: { initial: huxBux, attribute: 'voo', reflect: false },
    ...{
      bam: { initial: 'foo' },
      show: { initial: () => 'foo' },
    },
  },
  cssvars: {
    foo: 0,
    bar: '1',
    baz: BAZ_CSS_VAR,
  },
});
