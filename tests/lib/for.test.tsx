import { For, observable, tick } from '@maverick-js/elements';
import { render } from '@maverick-js/elements/dom';

it('should render non-keyed loop', async () => {
  const source = observable([1, 2, 3]);

  function Component() {
    return (
      <For each={source}>
        {(item, i) => (
          <span>
            {item()} - {i}
          </span>
        )}
      </For>
    );
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchSnapshot();

  // Change
  source.set([2, 3, 4]);
  await tick();
  expect(root).toMatchSnapshot();

  // Delete Last
  source.set([2, 3]);
  await tick();
  expect(root).toMatchSnapshot();

  // Add
  source.set([2, 3, 4, 5]);
  await tick();
  expect(root).toMatchSnapshot();

  // Delete First
  source.set([3, 4, 5]);
  await tick();
  expect(root).toMatchSnapshot();

  // Empty
  source.set([]);
  await tick();
  expect(root).toMatchSnapshot();
});
