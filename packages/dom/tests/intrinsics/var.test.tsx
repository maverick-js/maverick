import { render } from '@maverick-js/dom';
import { signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('static', () => {
  render(() => <div var:foo={1} var:bar={2} />, { target });

  const root = target.firstElementChild!;

  expect(root).toMatchSnapshot();
});

test('dynamic', () => {
  const foo = 'blue',
    bar = 50,
    car = null;

  render(() => <div var:foo={foo} var:bar={bar} var:car={car} />, { target });

  const root = target.firstElementChild!;

  expect(root).toMatchSnapshot();
});

test('signal', () => {
  const color = signal<string | null>('blue');

  render(() => <div $var:color={color} />, { target });

  const root = target.firstElementChild!;

  expect(root).toMatchSnapshot();

  color.set('red');
  tick();

  expect(root).toMatchSnapshot();

  color.set(null);
  tick();

  expect(root).toMatchSnapshot();
});
