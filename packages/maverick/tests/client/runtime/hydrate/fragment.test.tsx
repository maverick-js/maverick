import { signal, tick } from '@maverick-js/signals';
import { hydrate } from 'maverick.js';

import { startMarker } from '../utils';

it('should hydrate fragment', async () => {
  const $count = signal(0);

  const clickChildA = vi.fn();
  const clickChildB = vi.fn();

  const fragment = () => (
    <>
      <div $on:click={clickChildA}>A</div>
      {false && <div>Ignore</div>}
      <div $on:click={clickChildB}>B</div>
      {$count()}
    </>
  );

  function Component() {
    return <div>{fragment()}</div>;
  }

  // Component <div>
  const parent = document.createElement('div');
  // {fragment()}
  parent.appendChild(startMarker());

  // <div>A</div>
  const childA = document.createElement('div');
  childA.appendChild(document.createTextNode('A'));
  parent.appendChild(startMarker());
  parent.appendChild(childA);

  // <div>B</div>
  const childB = document.createElement('div');
  childB.appendChild(document.createTextNode('B'));
  parent.appendChild(startMarker());
  parent.appendChild(childB);

  // {$count()}
  const textNode = document.createTextNode('0');
  parent.appendChild(startMarker());
  parent.appendChild(textNode);

  const root = document.createElement('root');
  root.appendChild(startMarker());
  root.appendChild(parent);

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <div>
          A
        </div>
        <!--$-->
        <div>
          B
        </div>
        <!--$-->
        0
      </div>
    </root>
  `);

  hydrate(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <div>
          A
        </div>
        <!--$-->
        <div>
          B
        </div>
        <!--$-->
        0
        <!--/$-->
        <!--/$-->
      </div>
    </root>
  `);

  childA.dispatchEvent(new MouseEvent('click'));
  expect(clickChildA).toHaveBeenCalledOnce();

  childB.dispatchEvent(new MouseEvent('click'));
  expect(clickChildB).toHaveBeenCalledOnce();

  $count.set(10);
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <div>
          A
        </div>
        <!--$-->
        <div>
          B
        </div>
        <!--$-->
        10
        <!--/$-->
        <!--/$-->
      </div>
    </root>
  `);
});

it('should hydrate signal fragment', async () => {
  const clickChildA = vi.fn();
  const clickChildB = vi.fn();

  const $count = signal(0);
  const $fragment = signal(() => (
    <>
      <div $on:click={clickChildA}>A</div>
      {false && <div>Ignore</div>}
      <div $on:click={clickChildB}>B</div>
      {$count()}
    </>
  ));

  function Component() {
    return <div>{$fragment()}</div>;
  }

  // Component <div>
  const parent = document.createElement('div');
  // {$fragment()}
  parent.appendChild(startMarker());

  // <div>A</div>
  const childA = document.createElement('div');
  childA.appendChild(document.createTextNode('A'));
  parent.appendChild(startMarker());
  parent.appendChild(childA);

  // <div>B</div>
  const childB = document.createElement('div');
  childB.appendChild(document.createTextNode('B'));
  parent.appendChild(startMarker());
  parent.appendChild(childB);

  // {$count()}
  const textNode = document.createTextNode('0');
  parent.appendChild(startMarker());
  parent.appendChild(textNode);

  // test if closing comments are consumed
  parent.appendChild(document.createComment('/$'));
  parent.appendChild(document.createComment('/#'));

  const root = document.createElement('root');
  root.appendChild(startMarker());
  root.appendChild(parent);

  hydrate(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <div>
          A
        </div>
        <!--$-->
        <div>
          B
        </div>
        <!--$-->
        0
        <!--/$-->
        <!--/$-->
        <!--/$-->
        <!--/#-->
      </div>
    </root>
  `);

  childA.dispatchEvent(new MouseEvent('click'));
  expect(clickChildA).toHaveBeenCalledOnce();

  childB.dispatchEvent(new MouseEvent('click'));
  expect(clickChildB).toHaveBeenCalledOnce();

  $fragment.set(() => null);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--/$-->
        <!--/#-->
      </div>
    </root>
  `);

  $fragment.set(() => [1, 2, 3]);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        1
        2
        3
        <!--/$-->
        <!--/#-->
      </div>
    </root>
  `);
});
