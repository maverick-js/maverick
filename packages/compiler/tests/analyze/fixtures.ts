// @ts-nocheck
import { defineElement, defineProp } from '../../../maverick/src/element';
import { BaseComponent } from './types';

const props = {
  foo: 0,
  bar: defineProp({ value: 10, attribute: 'boo' }),
  lux: defineProp({ value: 20, attribute: false }),
  mooBoo: 1,
  ...{
    bam: 'foo',
    show: defineProp({ value: () => 'foo' }),
  },
  zoo: null,
  boo: defineProp({}),
};

/**
 * This is the `TestComponent` documentation.
 *
 * @slot This is the default slot.
 * @slot foo - This is the foo slot.
 * @csspart foo - This is the foo CSS Part.
 * @csspart bar - This is the bar CSS Part.
 */
class TestComponent extends BaseComponent {
  static el = defineElement({
    tagName: 'mk-foo',
    shadowRoot: true,
    props: { ...props, ...super.props },
  });

  /** This is the foo docs. */
  foo = true;

  readonly bar = 100;

  get #ignoredPrivateProp() {
    return false;
  }

  /**
   * This is the baz docs.
   */
  get baz() {
    return false;
  }

  get bux() {
    return false;
  }

  set bux(v) {}

  start(): void;

  /**
   * The stop method docs.
   */
  stop(fooArg: number, barArg: Bar): Promise<void> {}

  /** The resume method docs. */
  resume<T>(foo: T): T {}

  _ignoredMethod() {}

  #ignoredPrivateMethod() {}

  private privateMethod(): string {
    return '';
  }

  protected override onAttach(): void {}

  override render() {
    return null;
  }

  override destroy(): void {
    super.destroy();
  }
}
