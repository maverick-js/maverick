import { render } from '@maverick-js/dom';
import { Portal, type PortalTarget, signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('portal', () => {
  render(
    () => (
      <Portal to="body">
        <div>Content</div>
      </Portal>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('signal', () => {
  const to = signal<PortalTarget>('body');

  render(
    () => (
      <Portal to={to}>
        <div>Content</div>
      </Portal>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();

  to.set(null);
  tick();

  expect(target).toMatchSnapshot();
});
