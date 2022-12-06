import { signal, tick } from '@maverick-js/signals';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { createReactHook } from 'maverick.js/react';

it('should create hook', async () => {
  const $value = signal(0);

  function Component() {
    const [value, setValue] = createReactHook($value);
    return React.createElement('div', { onClick: () => setValue(value + 1) }, value);
  }

  const { container } = setup(React.createElement(Component));

  expect(container).toMatchInlineSnapshot(`
  <div>
    <div>
      0
    </div>
  </div>
`);

  await act(async () => {
    $value.set(1);
    await tick();
  });

  expect(container).toMatchInlineSnapshot(`
  <div>
    <div>
      1
    </div>
  </div>
`);

  act(() => {
    container.firstChild?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  expect($value()).toBe(2);
  expect(container).toMatchInlineSnapshot(`
  <div>
    <div>
      2
    </div>
  </div>
`);
});

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.body.innerHTML = '';
});

function setup(node: React.ReactNode) {
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  act(() => {
    root.render(node);
  });
  return { container, root };
}
