import { render } from '@maverick-js/dom';
import { ForKeyed, signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

it('should render keyed loop', () => {
  const $each = signal([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

  function Component() {
    return (
      <ForKeyed each={$each}>
        {(item, i) => (
          <span>
            {item.id} - {i()}
          </span>
        )}
      </ForKeyed>
    );
  }

  render(() => <Component />, { target });

  expect(target).toMatchSnapshot();

  // Change
  $each.set((p) => {
    const tmp = p[1];
    p[1] = p[0];
    p[0] = tmp;
    return [...p];
  });

  tick();

  expect(target).toMatchSnapshot();

  // Delete Last
  $each.set($each().slice(0, -1));
  tick();

  expect(target).toMatchSnapshot();

  // Add
  $each.set([...$each(), { id: 'd' }, { id: 'e' }]);
  tick();

  expect(target).toMatchSnapshot();

  // Delete First
  $each.set($each().slice(1));
  tick();

  expect(target).toMatchSnapshot();

  // Empty
  $each.set([]);
  tick();

  expect(target).toMatchSnapshot();
});
