import { ForKeyed, observable, tick } from 'maverick.js';
import { render } from 'maverick.js/dom';

it('should render keyed loop', async () => {
  const source = observable([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

  function Component() {
    return (
      <ForKeyed each={source}>
        {(item, i) => (
          <span>
            {item.id} - {i()}
          </span>
        )}
      </ForKeyed>
    );
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchSnapshot();

  // Change
  source.next((p) => {
    const tmp = p[1];
    p[1] = p[0];
    p[0] = tmp;
    return [...p];
  });
  await tick();
  expect(root).toMatchSnapshot();

  // Delete Last
  source.set(source().slice(0, -1));
  await tick();
  expect(root).toMatchSnapshot();

  // Add
  source.set([...source(), { id: 'd' }, { id: 'e' }]);
  await tick();
  expect(root).toMatchSnapshot();

  // Delete First
  source.set(source().slice(1));
  await tick();
  expect(root).toMatchSnapshot();

  // Empty
  source.set([]);
  await tick();
  expect(root).toMatchSnapshot();
});
