import { createEventTarget, type MaverickFunctionProps, signal, tick } from '@maverick-js/core';
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
    'var:color': 'blue',
    'on:click': onClick,
  };

  function Foo(props: MaverickFunctionProps<HTMLElement>) {
    createEventTarget();
    return <div class="boo" on:click />;
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
    'data-foo': '',
    'class:foo': true,
    'var:color': 'blue',
    'on:click': onClick,
  };

  const spreadB = {
    'class:hux': true,
    'class:lux': false,
    'data-bar': '',
    'var:color': 'red',
    '$var:bgColor': $bgColor,
    'on:pointerup': onPointerUp,
  };

  function Foo(props: MaverickFunctionProps<HTMLElement>) {
    createEventTarget();
    return <div class="zux" style="z-index: 10;" on:click on:pointerup />;
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
