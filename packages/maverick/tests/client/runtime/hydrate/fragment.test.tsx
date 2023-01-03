import { signal, tick } from '@maverick-js/signals';

import { hydrate } from 'maverick.js/dom';

import { endArrayMarker, startMarker } from '../utils';

it('should hydrate fragment', () => {
  const $count = signal(0),
    $show = signal(false);

  const clickChildA = vi.fn();
  const clickChildB = vi.fn();

  const fragment = () => (
    <>
      <div $on:click={clickChildA}>A</div>
      {false && <div>Ignore</div>}
      {$show() && <div>Show</div>}
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
  parent.appendChild(endArrayMarker());

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
        <!--/[]-->
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
      </div>
    </root>
  `);

  childA.dispatchEvent(new MouseEvent('click'));
  expect(clickChildA).toHaveBeenCalledOnce();

  childB.dispatchEvent(new MouseEvent('click'));
  expect(clickChildB).toHaveBeenCalledOnce();

  $count.set(10);
  $show.set(true);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <!--$-->
        <!--$-->
        <div>
          A
        </div>
        <div>
          Show
        </div>
        <div>
          B
        </div>
        10
      </div>
    </root>
  `);

  $count.set(20);
  $show.set(false);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <!--$-->
        <!--$-->
        <div>
          A
        </div>
        <div>
          B
        </div>
        20
      </div>
    </root>
  `);
});

it('should hydrate signal fragment', () => {
  const clickChildA = vi.fn();
  const clickChildB = vi.fn();

  const $count = signal(0),
    $fragment = signal(() => (
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
  parent.appendChild(endArrayMarker());

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
      </div>
    </root>
  `);

  childA.dispatchEvent(new MouseEvent('click'));
  expect(clickChildA).toHaveBeenCalledOnce();

  childB.dispatchEvent(new MouseEvent('click'));
  expect(clickChildB).toHaveBeenCalledOnce();

  $fragment.set(() => null);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        <!--~-->
        <!--$-->
        <!--$-->
      </div>
    </root>
  `);

  $fragment.set(() => [1, 2, 3]);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        1
        2
        3
        <!--$-->
        <!--$-->
        <!--~-->
        <!--$-->
        <!--$-->
      </div>
    </root>
  `);
});
