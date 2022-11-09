import { If, observable, render, tick } from 'maverick.js';

it('should render observable condition', async () => {
  const condition = observable(false);

  function Component() {
    return (
      <If condition={condition} else={<div>Falsy</div>}>
        <div>Truthy</div>
      </If>
    );
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div>
        Falsy
      </div>
      <!--/$-->
    </root>
  `);

  condition.set(true);
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div>
        Truthy
      </div>
      <!--/$-->
    </root>
  `);

  condition.set(false);
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div>
        Falsy
      </div>
      <!--/$-->
    </root>
  `);
});
