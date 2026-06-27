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
      fallbackTag: 'div',
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
    ref = vi.fn();

  const onClick = vi.fn((event) => {
    expect(event.target).toBeInstanceOf(Foo);
    expect(event.currentTarget).toBeInstanceOf(Foo);
  });

  class Foo extends Component<{
    events: {
      click: MaverickEvent<void>;
    };
    cssProps: {
      foo: number;
    };
  }> {
    static element: CustomElementOptions = {
      name: 'mk-foo',
      fallbackTag: 'div',
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

  expect(onClick).toHaveBeenCalledTimes(1);

  expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
});
