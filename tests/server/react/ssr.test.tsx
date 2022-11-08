import { createContext } from 'maverick.js';
import * as React from 'React';
import { renderToString } from 'react-dom/server';

import { defineElement, defineProp, onAttach } from 'maverick.js/element';
import { createReactElement, useReactContext } from 'maverick.js/react';

it('should render', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div>Test</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component);

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-foo>"',
  );
});

it('should render shadow dom', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    shadowRoot: true,
    setup: () => () => <div>Test</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component);

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><template shadowroot=\\"open\\"><!$><div>Test</div></template></mk-foo>"',
  );
});

it('should render with children', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div>Test</div>,
  });

  const Component = createReactElement(element);

  const Root = React.createElement(
    Component,
    {},
    React.createElement('div', {}, React.createElement('div', {}, 'content')),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div>Test</div></shadow-root><div><div>content</div></div></mk-foo>"',
  );
});

it('should notify host of children', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup:
      ({ host }) =>
      () =>
        !host.$children && <div>Test</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component, {}, React.createElement('div', {}, 'content'));

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root></shadow-root><div>content</div></mk-foo>"',
  );
});

it('should notify host of _no_ children', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup:
      ({ host }) =>
      () =>
        !host.$children && <div>Test</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component, { className: 'foo bar' });

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo class=\\"foo bar\\" mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-foo>"',
  );
});

it('should render with class', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: ({ host }) => {
      onAttach(() => {
        host.el!.classList.add('bax');
      });

      return () => <div>Test</div>;
    },
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component, { className: 'foo bar' });

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo class=\\"foo bar bax\\" mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-foo>"',
  );
});

it('should render with style', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: ({ host }) => {
      onAttach(() => {
        host.el!.style.setProperty('--bar', '10');
      });

      return () => null;
    },
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component, {
    style: { display: 'none', backgroundColor: 'red', '--mk-foo': '1' },
  });

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo style=\\"display:none;background-color:red;--mk-foo:1;--bar:10\\" mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root></shadow-root></mk-foo>"',
  );
});

it('should forward attributes', () => {
  const element = defineElement({ tagName: 'mk-foo' });
  const Component = createReactElement(element);
  const Root = React.createElement(Component, { 'aria-label': 'Label' });
  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo aria-label=\\"Label\\" mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root></shadow-root></mk-foo>"',
  );
});

it('should forward props', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    props: {
      foo: defineProp(10),
    },
    setup:
      ({ props }) =>
      () =>
        <div>{props.foo}</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component, { foo: 20 });
  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div><!$>20</div></shadow-root></mk-foo>"',
  );
});

it('should forward context map to maverick element', () => {
  const context = createContext(0);

  const elementA = defineElement({
    tagName: 'mk-foo',
    setup: () => {
      context.set(10);
      return () => null;
    },
  });

  const elementB = defineElement({
    tagName: 'mk-foo',
    setup: () => () => context.get(),
  });

  const ComponentA = createReactElement(elementA);
  const ComponentB = createReactElement(elementB);

  const Root = React.createElement(
    ComponentA,
    {},
    React.createElement('div', {}, React.createElement(ComponentB)),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root></shadow-root><div><mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root>10</shadow-root></mk-foo></div></mk-foo>"',
  );
});

it('should forward context to react element', () => {
  const context = createContext(0);

  const ParentElement = defineElement({
    tagName: 'mk-foo',
    setup: () => {
      context.set(10);
      return () => null;
    },
  });

  const Parent = createReactElement(ParentElement);

  function Child() {
    const value = useReactContext(context);
    return React.createElement('div', { id: 'react' }, value);
  }

  const Root = React.createElement(
    'div',
    {},
    React.createElement(Parent, null, React.createElement(Child)),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<div><mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root></shadow-root><div id=\\"react\\">10</div></mk-foo></div>"',
  );
});
