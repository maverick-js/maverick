import { BaseComponent } from './types';
import { prop, method } from '../../../../maverick/src/core/decorators';

const props = {
  foo: 0,
  bar: 10,
  lux: 20,
  mooBoo: 1,
  ...{
    bam: 'foo',
    show: 'foo',
  },
  zoo: null,
  boo: {},
};

/**
 * This is the `TestComponent` documentation.
 *
 * @part foo - This is the foo CSS Part.
 * @part bar - This is the bar CSS Part.
 */
export class TestComponent extends BaseComponent {
  static props = {
    ...props,
    ...super.props,
    box: undefined
  }

  /** This is the foo docs. */
  @prop
  foo = true;

  @prop
  readonly bar = 100;

  get #ignoredPrivateProp() {
    return false;
  }

  /**
   * This is the baz docs.
   */
  @prop
  get baz() {
    return false;
  }

  @prop
  get bux() {
    return false;
  }

  set bux() {}

  @method
  start(): void;

  /**
   * The stop method docs.
   */
  @method
  stop(fooArg: number, barArg: Bar): Promise<void> {}

  /** The resume method docs. */
  @method
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

