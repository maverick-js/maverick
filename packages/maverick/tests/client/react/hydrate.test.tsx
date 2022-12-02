import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { type AnyCustomElementDeclaration, defineCustomElement } from 'maverick.js/element';
import { createReactElement } from 'maverick.js/react';

it('should hydrate', () => {
  const onReactClick = vi.fn();
  const onMaverickClick = vi.fn();

  const Parent = (props) => React.createElement('div', { onClick: onReactClick }, props.children);

  const { definition, runHydration } = hydrate(
    { setup: () => () => <div $on:click={onMaverickClick}></div> },
    (el) => React.createElement(Parent, null, React.createElement(el)),
  );

  const container = document.createElement('div');

  container.innerHTML = [
    `<div>`,
    `<${definition.tagName} mk-h="" mk-d="">`,
    `<shadow-root>`,
    `<!--$--><div></div>`,
    `</shadow-root>`,
    `</${definition.tagName}>`,
    `</div>`,
  ].join('');

  const reactDiv = container.firstElementChild!,
    customEl = container.querySelector(definition.tagName)!,
    maverickDiv = customEl.firstElementChild!.firstElementChild!;

  runHydration(container);

  // Elements should be stable (i.e., not replaced).
  expect(container.firstElementChild).toStrictEqual(reactDiv);
  expect(container.querySelector(definition.tagName)).toStrictEqual(customEl);
  expect(customEl.firstElementChild!.firstElementChild!).toStrictEqual(maverickDiv);

  act(() => {
    reactDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    maverickDiv.dispatchEvent(new MouseEvent('click'));
  });

  expect(onReactClick).toHaveBeenCalled();
  expect(onMaverickClick).toHaveBeenCalled();
});

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  document.body.innerHTML = '';
});

let count = 0;
function hydrate(
  declaration: Partial<AnyCustomElementDeclaration>,
  children?: (element: any) => React.ReactNode,
) {
  const definition = defineCustomElement({
    tagName: `mk-foo-${++count}`,
    ...declaration,
  });

  const element = createReactElement(definition);

  return {
    definition,
    runHydration: (container: Element) => {
      act(() => {
        hydrateRoot(container, children?.(element) ?? React.createElement(element));
      });
    },
  };
}
