import { createContext, provideContext, useContext } from 'maverick.js';
import * as React from 'React';
import { renderToString } from 'react-dom/server';

import { defineCustomElement, onAttach } from 'maverick.js/element';
import { createReactElement, useReactContext } from 'maverick.js/react';

it('should render', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () => <div>Test</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component);

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-foo>"',
  );
});

it('should render shadow dom', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo-2',
    shadowRoot: true,
    setup: () => () => <div>Test</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component);

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo-2 mk-h=\\"\\" mk-d=\\"\\"><template shadowroot=\\"open\\"><!$><div>Test</div></template></mk-foo-2>"',
  );
});

it('should render with children', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo-3',
    setup: () => () => <div>Test</div>,
  });

  const Component = createReactElement(element);

  const Root = React.createElement(
    Component,
    {},
    React.createElement('div', {}, React.createElement('div', {}, 'content')),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo-3 mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Test</div></shadow-root><div><div>content</div></div></mk-foo-3>"',
  );
});

it('should render with class', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo-6',
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
    '"<mk-foo-6 class=\\"foo bar bax\\" mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-foo-6>"',
  );
});

it('should render with style', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo-7',
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
    '"<mk-foo-7 style=\\"display:none;background-color:red;--mk-foo:1;--bar:10\\" mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root></mk-foo-7>"',
  );
});

it('should forward attributes', () => {
  const element = defineCustomElement({ tagName: 'mk-foo-8' });
  const Component = createReactElement(element);
  const Root = React.createElement(Component, { 'aria-label': 'Label' });
  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo-8 aria-label=\\"Label\\" mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root></mk-foo-8>"',
  );
});

it('should forward props', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo-9',
    // @ts-expect-error
    props: {
      foo: { initial: 10 },
    },
    setup:
      ({ props }) =>
      () =>
        <div>{props.foo}</div>,
  });

  const Component = createReactElement(element);
  const Root = React.createElement(Component, { foo: 20 });
  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo-9 mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div><!$>20</div></shadow-root></mk-foo-9>"',
  );
});

it('should forward context map to maverick element', () => {
  const Context = createContext(() => 0);

  const elementA = defineCustomElement({
    tagName: 'mk-foo-10',
    setup: () => {
      provideContext(Context, 10);
      return () => null;
    },
  });

  const elementB = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () => useContext(Context),
  });

  const ComponentA = createReactElement(elementA);
  const ComponentB = createReactElement(elementB);

  const Root = React.createElement(
    ComponentA,
    {},
    React.createElement('div', {}, React.createElement(ComponentB)),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-foo-10 mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root><div><mk-foo mk-h=\\"\\" mk-d=\\"\\"><shadow-root>10</shadow-root></mk-foo></div></mk-foo-10>"',
  );
});

it('should forward context to react element', () => {
  const Context = createContext(() => 0);

  const ParentElement = defineCustomElement({
    tagName: 'mk-foo-11',
    setup: () => {
      provideContext(Context, 10);
      return () => null;
    },
  });

  const Parent = createReactElement(ParentElement);

  function Child() {
    const value = useReactContext(Context);
    return React.createElement('div', { id: 'react' }, value);
  }

  const Root = React.createElement(
    'div',
    {},
    React.createElement(Parent, null, React.createElement(Child)),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<div><mk-foo-11 mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root><div id=\\"react\\">10</div></mk-foo-11></div>"',
  );
});
