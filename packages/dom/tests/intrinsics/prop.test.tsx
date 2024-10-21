import { signal, tick } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('static', () => {
  render(() => <input prop:checked />, { target });

  const input = target.firstElementChild! as HTMLInputElement;
  expect(input.checked).toBe(true);
});

test('dynamic', () => {
  const isChecked = true;

  render(() => <input prop:checked={isChecked} />, { target });

  const input = target.firstElementChild! as HTMLInputElement;
  expect(input.checked).toBe(true);
});

test('signal', () => {
  const $isChecked = signal(false);

  render(() => <input $prop:checked={$isChecked} />, { target });

  const input = target.firstElementChild! as HTMLInputElement;
  expect(input.checked).toBe(false);

  $isChecked.set(true);
  tick();

  expect(input.checked).toBe(true);
});
