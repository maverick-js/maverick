import { signal, tick } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('static', () => {
  render(() => <div class="..." class:foo />, { target });
  expect(target).toMatchSnapshot();
});

test('dynamic', () => {
  const foo = true;
  render(() => <div class="..." class:foo={foo} />, { target });
  expect(target).toMatchSnapshot();
});

test('signal', () => {
  const $foo = signal(true);

  render(() => <div $class:foo={$foo} />, { target });

  expect(target).toMatchSnapshot();

  $foo.set(false);
  tick();

  expect(target).toMatchSnapshot();
});

test('with dynamic base', () => {
  const $foo = signal(true),
    classes = 'bar bux';

  render(() => <div class={classes} $class:foo={$foo} />, { target });

  expect(target).toMatchSnapshot();

  $foo.set(false);
  tick();
  expect(target).toMatchSnapshot();
});

test('with signal base', () => {
  const $foo = signal(true),
    $class = signal('bar bux');

  render(() => <div $class={$class} $class:foo={$foo} />, { target });

  expect(target).toMatchSnapshot();

  $class.set('hux lux');
  tick();
  expect(target).toMatchSnapshot();

  $foo.set(false);
  tick();
  expect(target).toMatchSnapshot();
});
