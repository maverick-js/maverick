import { For, observable, tick } from 'maverick.js';
import { render } from 'maverick.js/dom';

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

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <span>
      <!--$-->
      1
      <!--/$-->
      - 
      0
    </span>
    <span>
      <!--$-->
      2
      <!--/$-->
      - 
      1
    </span>
    <span>
      <!--$-->
      3
      <!--/$-->
      - 
      2
    </span>
    <!--/$-->
  </root>
`);

  // Change
  source.set([2, 3, 4]);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <span>
      <!--$-->
      2
      <!--/$-->
      - 
      0
    </span>
    <span>
      <!--$-->
      3
      <!--/$-->
      - 
      1
    </span>
    <span>
      <!--$-->
      4
      <!--/$-->
      - 
      2
    </span>
    <!--/$-->
  </root>
`);

  // Delete Last
  source.set([2, 3]);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <span>
      <!--$-->
      2
      <!--/$-->
      - 
      0
    </span>
    <span>
      <!--$-->
      3
      <!--/$-->
      - 
      1
    </span>
    <!--/$-->
  </root>
`);

  // Add
  source.set([2, 3, 4, 5]);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <span>
      <!--$-->
      2
      <!--/$-->
      - 
      0
    </span>
    <span>
      <!--$-->
      3
      <!--/$-->
      - 
      1
    </span>
    <span>
      <!--$-->
      4
      <!--/$-->
      - 
      2
    </span>
    <span>
      <!--$-->
      5
      <!--/$-->
      - 
      3
    </span>
    <!--/$-->
  </root>
`);

  // Delete First
  source.set([3, 4, 5]);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <span>
      <!--$-->
      3
      <!--/$-->
      - 
      0
    </span>
    <span>
      <!--$-->
      4
      <!--/$-->
      - 
      1
    </span>
    <span>
      <!--$-->
      5
      <!--/$-->
      - 
      2
    </span>
    <!--/$-->
  </root>
`);

  // Empty
  source.set([]);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <!--/$-->
  </root>
`);
});
