// @ts-nocheck
import type { FooElement } from './types';

export const FooElementDefinition = defineCustomElement<FooElement>({
  tagName: 'mk-foo',
  shadowRoot: true,
  props: {
    foo: { initial: 0 },
    bar: { initial: 10, attribute: 'boo' },
    lux: { initial: 20, attribute: false },
    baxHux: { initial: 30, reflect: true },
    huxBux: { initial: huxBux, attribute: 'voo', reflect: false },
    mooBoo: { initial: 1 },
    ...{
      bam: { initial: 'foo' },
      show: { initial: () => 'foo' },
    },
    zoo: {},
  },
});
