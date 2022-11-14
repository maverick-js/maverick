import { computed, observable } from '@maverick-js/observables';

import {
  defineCSSVar,
  defineCSSVars,
  defineElement,
  defineEvents,
  defineProp,
  DOMEvent,
  type ElementCSSVarRecord,
} from 'maverick.js/element';

export const FooElement = defineElement({
  tagName: 'mk-foo',
});

/**
 * This is the `BarElement` documentation.
 */
export const BarElement = defineElement({
  tagName: 'mk-bar',
});

/**
 * @fooTag 1
 * @barTag This is a little description.
 */
export const BazElement = defineElement({
  tagName: 'mk-baz',
  shadowRoot: true,
});

type A = boolean | null;
type B = A | 0;
type C = string | null;
let huxBux: string | null = 'lemons';

/**
 * @slot - This is the default slot.
 * @slot foo - This is the foo slot.
 * @csspart foo - The foo part.
 * @csspart bar - The bar part.
 * @cssvar bax - The foo var.
 * @cssvar hux - The bar var.
 */
export const BaxElement = defineElement({
  tagName: 'mk-bax',
  props: {
    /**
     * The foo prop docs.
     *
     * @fooTag ...
     */
    foo: { initial: 0 },
    bar: { initial: 10, attribute: 'boo' },
    lux: { initial: 20, attribute: false },
    baxHux: { initial: 30, reflect: true },
    huxBux: defineProp(huxBux, { attribute: 'voo', reflect: false }),
    hoo: defineProp<number | boolean>(10),
    /** @internal */
    chux: defineProp<A>(false),
    nux: defineProp<B>(false),
    ...{
      bam: { initial: 'foo' },
      show: { initial: () => 'foo' },
    },
  },
  cssvars: {
    foo: 0,
    /**
     * The bar cssvar docs.
     *
     * @fooTag ...
     */
    bar: defineCSSVar<0 | 1>(0),
    baz: defineCSSVar<C>(null),
  },
  events: {
    foo: {},
  },
});

interface BaseCSSVars {
  lux: 'foo' | 'bar';
}

interface HuxCSSVars extends ElementCSSVarRecord, BaseCSSVars {
  hux: string;
}

type TootCSSVars = {
  /**
   * The toot cssvar docs.
   *
   * @required
   */
  toot: string;
};

/**
 * The foo event.
 *
 * @composed
 */
type FooEvent = DOMEvent<void>;

export const HuxElement = defineElement({
  tagName: 'mk-hux',
  cssvars: defineCSSVars<
    {
      /**
       * The foo cssvar docs.
       *
       * @fooTag ...
       */
      foo: number;
      bar: C;
    } & {
      bax: 0 | 1;
    } & HuxCSSVars &
      TootCSSVars
  >(),
  events: defineEvents<{
    foo: FooEvent;
    /**
     * The bar event docs.
     *
     * @bubbles
     */
    bar: DOMEvent<boolean>;
  }>(),
});

export const LuxElement = defineElement({
  tagName: 'mk-hux',
  parent: HuxElement,
  props: {
    foo: { initial: 0 },
  },
  cssvars: (props) => {
    return {
      foo: 10,
      /** The bar cssvar docs. */
      bar: () => props.foo,
    };
  },
  setup() {
    const $a = observable(0);

    const $b = computed(() => ({
      id: $a() + '',
    }));

    /** Hux method docs. */
    const hux = () => 100;

    /** Lux method docs. */
    function lux(name: string, height: number) {
      return name;
    }

    return {
      /** @deprecated */
      foo: 1,
      /** This is the bar prop docs. */
      get bar() {
        return 10;
      },
      get far() {
        return $a();
      },
      set far(v: number) {
        $a.set(v);
      },
      get toot() {
        return $b();
      },
      hux,
      lux,
      /** @internal */
      low(...args: any[]): string[] {
        return [];
      },
      $render: () => null,
    };
  },
});
