import { render } from '@maverick-js/dom';
import { signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('static', () => {
  render(() => <div style:color="blue" />, { target });

  const root = target.firstElementChild!;
  expect(root).toMatchSnapshot();
});

test('dynamic', () => {
  const color = 'blue',
    bgColor = 'red';

  render(() => <div style:color={color} style:backgroundColor={bgColor} />, { target });

  const root = target.firstElementChild!;
  expect(root).toMatchSnapshot();
});

test('signal', () => {
  const color = signal<string | null>('blue');

  render(() => <div $style:color={color} />, { target });

  const root = target.firstElementChild!;
  expect(root).toMatchSnapshot();

  color.set('red');
  tick();

  expect(root).toMatchSnapshot();

  color.set(null);
  tick();

  expect(root).toMatchSnapshot();
});

test('with dynamic base', () => {
  const $color = signal('red'),
    styles = 'background-color: pink;';

  render(() => <div style={styles} $style:color={$color} />, { target });

  expect(target).toMatchSnapshot();

  $color.set('orange');
  tick();
  expect(target).toMatchSnapshot();
});

test('with signal base', () => {
  const $color = signal('red'),
    $style = signal('background-color: red;');

  render(() => <div $style={$style} $style:color={$color} />, { target });

  expect(target).toMatchSnapshot();

  $style.set('background-color: red; z-index: 10;');
  tick();
  expect(target).toMatchSnapshot();

  $color.set('blue');
  tick();
  expect(target).toMatchSnapshot();
});
