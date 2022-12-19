import { signal, tick } from '@maverick-js/signals';
import { hydrate } from 'maverick.js';

import { startMarker } from '../utils';

it('should hydrate expression', () => {
  const $count = signal(0);

  const click = vi.fn();
  const expression = $count() === 0 ? <div $on:click={click}>Yes</div> : 'No';

  function Component() {
    return <div>{expression}</div>;
  }

  const child = document.createElement('div');
  child.appendChild(document.createTextNode('Yes'));

  const parent = document.createElement('div');
  parent.appendChild(startMarker());
  parent.appendChild(startMarker());
  parent.appendChild(child);

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
          Yes
        </div>
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
          Yes
        </div>
      </div>
    </root>
  `);

  child.dispatchEvent(new MouseEvent('click'));
  expect(click).toHaveBeenCalledOnce();

  $count.set(1);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$-->
      <div>
        <!--$-->
        <!--$-->
        No
      </div>
    </root>
  `);
});
