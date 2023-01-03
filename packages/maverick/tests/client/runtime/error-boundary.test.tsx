import { effect, ErrorBoundary, signal, tick } from 'maverick.js';

import { render } from 'maverick.js/dom';

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
      <div>
        Child
      </div>
    </root>
  `);
});

it('should handle error', () => {
  const error = new Error(),
    shouldThrow = signal(false);

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
      <div>
        Good
        <!--$-->
      </div>
    </root>
  `);

  shouldThrow.set(true);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        Bad
        <!--$-->
      </div>
    </root>
  `);

  shouldThrow.set(false); // handled error
  root.firstElementChild?.dispatchEvent(new MouseEvent('click'));
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        Good
        <!--$-->
      </div>
    </root>
  `);
});

it('should invoke `onError` property', () => {
  let error = new Error(),
    handler = vi.fn(),
    resolve!: () => void,
    shouldThrow = signal(false);

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
      <div>
        Good
        <!--$-->
      </div>
    </root>
  `);

  shouldThrow.set(true);
  tick();

  expect(handler).toHaveBeenCalledWith(error);
  expect(handler).toHaveBeenCalledTimes(1);
  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        Bad
        <!--$-->
      </div>
    </root>
  `);

  resolve();
  shouldThrow.set(false);
  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        Good
        <!--$-->
      </div>
    </root>
  `);
});
