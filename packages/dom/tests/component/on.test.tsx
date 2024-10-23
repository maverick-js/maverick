import { Component, type JSX } from '@maverick-js/core';
import { render } from '@maverick-js/dom';
import type { MaverickEvent } from '@maverick-js/std';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('on', () => {
  const onFoo = vi.fn();

  interface Events {
    foo: MaverickEvent<void>;
  }

  class Foo extends Component<{}, {}, Events> {
    override render(): JSX.Element {
      return (
        <div
          on:click={() => {
            this.dispatch('foo');
          }}
        ></div>
      );
    }
  }

  render(() => <Foo on:foo={onFoo} />, { target });

  const el = target.firstElementChild!;

  el.dispatchEvent(new MouseEvent('click'));
  expect(onFoo).toHaveBeenCalled();
});
