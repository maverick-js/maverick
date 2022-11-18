import { effect, ErrorBoundary, observable, render, tick } from 'maverick.js';

it('should return children', () => {
  function Component() {
    return (
      <ErrorBoundary>
        <div>Child</div>
      </ErrorBoundary>
    );
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <div>
      Child
    </div>
    <!--/$-->
  </root>
`);
});

it('should handle error', async () => {
  const error = new Error(),
    shouldThrow = observable(false);

  function Component() {
    return (
      <ErrorBoundary>
        {($error) => {
          effect(() => {
            if (shouldThrow()) throw error;
          });
          return <div $on:click={$error.handled}>{$error() ? 'Bad' : 'Good'}</div>;
        }}
      </ErrorBoundary>
    );
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <div>
      <!--$-->
      Good
      <!--/$-->
    </div>
    <!--/$-->
  </root>
`);

  shouldThrow.set(true);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <div>
      <!--$-->
      Bad
      <!--/$-->
    </div>
    <!--/$-->
  </root>
`);

  shouldThrow.set(false); // handled error
  root.firstElementChild?.dispatchEvent(new MouseEvent('click'));
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <div>
      <!--$-->
      Good
      <!--/$-->
    </div>
    <!--/$-->
  </root>
`);
});

it('should invoke `onError` property', async () => {
  let error = new Error(),
    handler = vi.fn(),
    resolve!: () => void,
    shouldThrow = observable(false);

  function Component() {
    return (
      <ErrorBoundary
        onError={(error, handled) => {
          handler(error);
          resolve = handled;
        }}
      >
        {($error) => {
          effect(() => {
            if (shouldThrow()) throw error;
          });
          return <div>{$error() ? 'Bad' : 'Good'}</div>;
        }}
      </ErrorBoundary>
    );
  }

  const root = document.createElement('root');
  render(() => <Component />, { target: root });

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <div>
      <!--$-->
      Good
      <!--/$-->
    </div>
    <!--/$-->
  </root>
`);

  shouldThrow.set(true);
  await tick();

  expect(handler).toHaveBeenCalledWith(error);
  expect(handler).toHaveBeenCalledTimes(1);
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div>
        <!--$-->
        Bad
        <!--/$-->
      </div>
      <!--/$-->
    </root>
  `);

  resolve();
  shouldThrow.set(false);
  await tick();

  expect(root).toMatchInlineSnapshot(`
  <root>
    <!--$$-->
    <div>
      <!--$-->
      Good
      <!--/$-->
    </div>
    <!--/$-->
  </root>
`);
});
