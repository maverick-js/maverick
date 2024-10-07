import { render } from '@maverick-js/dom';
import { For, signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

it('should render non-keyed loop', () => {
  const $each = signal([1, 2, 3]);

  function Component() {
    return (
      <For each={$each}>
        {(item, i) => (
          <span>
            {item} - {i}
          </span>
        )}
      </For>
    );
  }

  render(() => <Component />, { target });

  expect(target).toMatchSnapshot();

  // Change
  $each.set([2, 3, 4]);
  tick();

  expect(target).toMatchSnapshot();

  // Delete Last
  $each.set([2, 3]);
  tick();

  expect(target).toMatchSnapshot();

  // Add
  $each.set([2, 3, 4, 5]);
  tick();

  expect(target).toMatchSnapshot();

  // Delete First
  $each.set([3, 4, 5]);
  tick();

  expect(target).toMatchSnapshot();

  // Empty
  $each.set([]);
  tick();

  expect(target).toMatchSnapshot();
});
