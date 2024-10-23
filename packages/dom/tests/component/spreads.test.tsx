import { Component, Host, type JSX, signal, tick } from '@maverick-js/core';
import { render } from '@maverick-js/dom';
import type { MaverickEvent } from '@maverick-js/std';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('one spread', () => {
  const onClick = vi.fn();

  const spread = {
    'class:foo': true,
    'var:color': 'blue',
    'on:click': onClick,
  };

  class Foo extends Component<{}, {}, { click: MaverickEvent<void> }> {
    override render(): JSX.Element {
      return <Host as="div" class="boo" on:click={() => this.dispatch('click')} />;
    }
  }

  render(() => <Foo {...spread} />, { target });

  const el = target.firstElementChild!;

  expect(el).toMatchSnapshot();

  const event = new MouseEvent('click');
  el.dispatchEvent(event);
  expect(onClick).toHaveBeenCalled();
});

test('multiple spreads', () => {
  const onClick = vi.fn(),
    onPointerUp = vi.fn(),
    $bgColor = signal('red');

  const spreadA = {
    'class:foo': true,
    'var:color': 'blue',
    'on:click': onClick,
  };

  const spreadB = {
    'class:hux': true,
    'class:lux': false,
    'var:color': 'red',
    '$var:bgColor': $bgColor,
    'on:pointerup': onPointerUp,
  };

  class Foo extends Component<
    {},
    {},
    { click: MaverickEvent<void>; pointerup: MaverickEvent<void> }
  > {
    override render(): JSX.Element {
      return (
        <Host
          as="div"
          class="zux"
          style="z-index: 10;"
          on:click={() => this.dispatch('click')}
          on:pointerup={() => this.dispatch('pointerup')}
        />
      );
    }
  }

  render(() => <Foo class="hux" {...spreadA} {...spreadB} />, { target });

  const el = target.firstElementChild!;

  expect(el).toMatchSnapshot();

  $bgColor.set('orange');
  tick();

  expect(el).toMatchSnapshot();

  const clickEvent = new MouseEvent('click');
  el.dispatchEvent(clickEvent);
  expect(onClick).toHaveBeenCalled();

  const pointerUpEvent = new PointerEvent('pointerup');
  el.dispatchEvent(pointerUpEvent);
  expect(onPointerUp).toHaveBeenCalled();
});
