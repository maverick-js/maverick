import { signal, tick } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('one spread', () => {
  const onClick = vi.fn();

  const spread = {
    'data-foo': '',
    'class:foo': true,
    'style:color': 'var(--color)',
    'var:color': 'blue',
    'on:click': onClick,
  };

  render(() => <div {...spread} />, { target });

  const el = target.firstElementChild!;

  expect(el).toMatchSnapshot();

  const event = new MouseEvent('click');
  el.dispatchEvent(event);
  expect(onClick).toHaveBeenCalledWith(event);
});

test('multiple spreads', () => {
  const onClick = vi.fn(),
    onPointerUp = vi.fn(),
    $bgColor = signal('red'),
    $class = signal('bar bux');

  const spreadA = {
    'data-foo': '',
    'class:foo': true,
    'style:color': 'var(--color)',
    'var:color': 'blue',
    'on:click': onClick,
  };

  const spreadB = {
    'class:hux': true,
    'class:lux': false,
    'data-bar': '',
    '$style:backgroundColor': $bgColor,
    'var:color': 'red',
    'on:pointerup': onPointerUp,
  };

  render(() => <div $class={$class} style="--foo: 10;" {...spreadA} {...spreadB} />, { target });

  const el = target.firstElementChild!;

  expect(el).toMatchSnapshot();

  $class.set('tux mux');
  $bgColor.set('orange');
  tick();

  expect(el).toMatchSnapshot();

  const clickEvent = new MouseEvent('click');
  el.dispatchEvent(clickEvent);
  expect(onClick).toHaveBeenCalledWith(clickEvent);

  const pointerUpEvent = new PointerEvent('pointerup');
  el.dispatchEvent(pointerUpEvent);
  expect(onPointerUp).toHaveBeenCalledWith(pointerUpEvent);
});
