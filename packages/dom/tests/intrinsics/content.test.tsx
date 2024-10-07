import { render } from '@maverick-js/dom';
import { signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('static', () => {
  render(() => <div innerHTML="<span>Hello</span>" />, { target });
  expect(target).toMatchSnapshot();
});

test('dynamic', () => {
  const innerHTML = '<span>Hello</span>';
  render(() => <div innerHTML={innerHTML} />, { target });
  expect(target).toMatchSnapshot();
});

test('signal', () => {
  const $innerHTML = signal('<span>Yes</span>');

  render(() => <div $innerHTML={$innerHTML} />, { target });

  expect(target).toMatchSnapshot();

  $innerHTML.set('No');
  tick();

  expect(target).toMatchSnapshot();
});
