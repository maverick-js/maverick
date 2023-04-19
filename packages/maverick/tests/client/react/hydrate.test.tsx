import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

import { Component, type ComponentConstructor, defineElement } from 'maverick.js/element';
import { createReactElement } from 'maverick.js/react';

it('should hydrate', () => {
  const onReactClick = vi.fn();
  const onMaverickClick = vi.fn();

  const Parent = (props) => React.createElement('div', { onClick: onReactClick }, props.children);

  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-foo` });
    override render() {
      return <div $on:click={onMaverickClick}></div>;
    }
  }

  const { runHydration } = hydrate(TestComponent, (el) =>
    React.createElement(Parent, null, React.createElement(el)),
  );

  const container = document.createElement('div');

  container.innerHTML = [
    `<div>`,
    `<mk-foo mk-h="" mk-d="">`,
    `<shadow-root>`,
    `<!--$--><div></div>`,
    `</shadow-root>`,
    `</mk-foo>`,
    `</div>`,
  ].join('');

  const reactDiv = container.firstElementChild!,
    customEl = container.querySelector('mk-foo')!,
    maverickDiv = customEl.firstElementChild!.firstElementChild!;

  runHydration(container);

  // Elements should be stable (i.e., not replaced).
  expect(container.firstElementChild).toStrictEqual(reactDiv);
  expect(container.querySelector('mk-foo')).toStrictEqual(customEl);
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

function hydrate(
  TestComponent: ComponentConstructor,
  children?: (element: any) => React.ReactNode,
) {
  const element = createReactElement(TestComponent);
  return {
    runHydration: (container: Element) => {
      act(() => {
        hydrateRoot(container, children?.(element) ?? React.createElement(element));
      });
    },
  };
}
