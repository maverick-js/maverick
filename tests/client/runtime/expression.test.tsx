import { observable, tick } from '@maverick-js/observables';
import { render } from 'maverick.js';

it('should render expression', async () => {
  const count = observable(0);
  const expression = count() > 1 ? <div>Yes</div> : <div>No</div>;

  const root = document.createElement('root');
  render(() => expression, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div>
        No
      </div>
      <!--/$-->
    </root>
  `);

  count.set(2);
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div>
        Yes
      </div>
      <!--/$-->
    </root>
  `);
});

it('should insert expression', async () => {
  const count = observable(0);
  const expression = count() > 1 ? <div>Yes</div> : 'No';

  function Component() {
    return <div>{expression}</div>;
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        <!--$-->
        No
        <!--/$-->
      </div>
    </root>
  `);

  count.set(2);
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        <!--$-->
        <div>
          Yes
        </div>
        <!--/$-->
      </div>
    </root>
  `);
});
