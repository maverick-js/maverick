import { signal, tick } from '@maverick-js/signals';
import { render } from 'maverick.js';

it('should render expression', () => {
  const count = signal(0);
  const expression = count() > 1 ? <div>Yes</div> : <div>No</div>;

  const root = document.createElement('root');
  render(() => expression, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        No
      </div>
    </root>
  `);

  count.set(2);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        Yes
      </div>
    </root>
  `);
});

it('should insert expression', () => {
  const count = signal(0);
  const expression = count() > 1 ? <div>Yes</div> : 'No';

  function Component() {
    return <div>{expression}</div>;
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        No
        <!--$-->
      </div>
    </root>
  `);

  count.set(2);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        <div>
          Yes
        </div>
        <!--$-->
      </div>
    </root>
  `);
});
