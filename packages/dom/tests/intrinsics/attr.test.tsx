import { render } from '@maverick-js/dom';
import { signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('static', () => {
  render(() => <div data-foo={1920} data-bar={1080} />, { target });
  expect(target).toMatchSnapshot();
});

test('dynamic', () => {
  const foo = 1920,
    bar = 1080;
  render(() => <div data-foo={foo} data-bar={bar} />, { target });
  expect(target).toMatchSnapshot();
});

test('signal', () => {
  const $foo = signal(1920);

  render(() => <div $data-foo={$foo} />, { target });

  expect(target).toMatchSnapshot();

  $foo.set(720);
  tick();

  expect(target).toMatchSnapshot();
});
