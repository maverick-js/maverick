import {
  Component,
  createEventTarget,
  type FunctionComponentProps,
  type JSX,
} from '@maverick-js/core';
import { render } from '@maverick-js/dom';
import type { Event } from '@maverick-js/std';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('function component', () => {
  const onClick = vi.fn(),
    onFoo = vi.fn();

  interface Events {
    click: MouseEvent;
    foo: Event<void>;
  }

  function Foo(props: FunctionComponentProps<HTMLElement, {}, Events>) {
    const events = createEventTarget<Events>();
    return (
      <div
        on:click
        on:pointerup={() => {
          events.dispatch('foo');
        }}
      ></div>
    );
  }

  render(() => <Foo on:click={onClick} on:foo={onFoo} />, { target });

  const el = target.firstElementChild!;

  const clickEvent = new MouseEvent('click');
  el.dispatchEvent(clickEvent);

  const onClickArg = onClick.mock.calls[0][0];
  expect(onClickArg.target).toBe(clickEvent.target);
  expect(onClickArg.currentTarget).toBe(clickEvent.currentTarget);

  el.dispatchEvent(new PointerEvent('pointerup'));
  expect(onFoo).toHaveBeenCalled();
});

test('class component', () => {
  const onClick = vi.fn();

  interface Events {
    click: MouseEvent;
  }

  class Foo extends Component<{}, {}, Events> {
    override render(): JSX.Element {
      return <div on:click></div>;
    }
  }

  render(() => <Foo on:click={onClick} />, { target });

  const el = target.firstElementChild!;

  const clickEvent = new MouseEvent('click');
  el.dispatchEvent(clickEvent);

  const onClickArg = onClick.mock.calls[0][0];
  expect(onClickArg.target).toBe(clickEvent.target);
  expect(onClickArg.currentTarget).toBe(clickEvent.currentTarget);
});
