import {
  Component,
  type CustomElementOptions,
  Host,
  type JSX,
  signal,
  tick,
} from '@maverick-js/core';
import { render } from '@maverick-js/dom';
import type { MaverickEvent } from '@maverick-js/std';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('<Host>', () => {
  const onClick = vi.fn();

  class Foo extends Component {
    static element: CustomElementOptions = {
      name: 'mk-foo',
      defaultTag: 'div',
    };

    override render(): JSX.Element {
      return (
        <Host class="foo" data-foo class:bar var:foo={10} on:click={onClick}>
          <span>Contents</span>
        </Host>
      );
    }
  }

  render(() => <Foo />, { target });

  expect(target).toMatchSnapshot();

  const el = target.firstElementChild!;

  const event = new MouseEvent('click');
  el.dispatchEvent(event);
  expect(onClick).toHaveBeenCalledWith(event);
});

test('attach to host', () => {
  const $foo = signal(10),
    onClick = vi.fn(),
    ref = vi.fn();

  class Foo extends Component<{}, {}, { click: MaverickEvent<void> }, { foo: number }> {
    static element: CustomElementOptions = {
      name: 'mk-foo',
      defaultTag: 'div',
    };

    override render(): JSX.Element {
      return (
        <Host class="foo" on:click={() => this.dispatch('click')}>
          <span>Contents</span>
        </Host>
      );
    }
  }

  render(
    () => <Foo class="bar" data-foo class:hux $var:foo={$foo} on:click={onClick} ref={ref} />,
    { target },
  );

  expect(target).toMatchSnapshot();

  $foo.set(20);
  tick();

  expect(target).toMatchSnapshot();

  const el = target.firstElementChild!;

  const clickEvent = new MouseEvent('click');
  el.dispatchEvent(clickEvent);

  const onClickArg = onClick.mock.calls[0][0];
  expect(onClickArg.target).toBeInstanceOf(Foo);
  expect(onClickArg.currentTarget).toBeInstanceOf(Foo);

  expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
});
