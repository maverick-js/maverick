import { createContext, provideContext, useContext } from 'maverick.js';
import * as React from 'React';
import { renderToString } from 'react-dom/server';

import { Component, defineElement } from 'maverick.js/element';
import { createReactElement, useReactContext } from 'maverick.js/react';

it('should render', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    override render() {
      return <div>Test</div>;
    }
  }

  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(ReactComponent);

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-test>"',
  );
});

it('should render shadow dom', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test`, shadowRoot: true });
    override render() {
      return <div>Test</div>;
    }
  }

  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(ReactComponent);

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test mk-h=\\"\\" mk-d=\\"\\"><template shadowroot=\\"open\\"><!$><div>Test</div></template></mk-test>"',
  );
});

it('should render with children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    override render() {
      return <div>Test</div>;
    }
  }

  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(
    ReactComponent,
    {},
    React.createElement('div', {}, React.createElement('div', {}, 'content')),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Test</div></shadow-root><div><div>content</div></div></mk-test>"',
  );
});

it('should render with class', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    override onAttach(el) {
      el.classList.add('bax');
    }
    override render() {
      return <div>Test</div>;
    }
  }

  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(ReactComponent, { className: 'foo bar' });

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test class=\\"foo bar bax\\" mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Test</div></shadow-root></mk-test>"',
  );
});

it('should render with style', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    override onAttach(el) {
      el.style.setProperty('--bar', '10');
    }
    override render() {
      return null;
    }
  }

  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(ReactComponent, {
    style: { display: 'none', backgroundColor: 'red', '--mk-test': '1' },
  });

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test style=\\"display:none;background-color:red;--mk-test:1;--bar:10\\" mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root></mk-test>"',
  );
});

it('should forward attributes', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
  }
  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(ReactComponent, { 'aria-label': 'Label' });
  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test aria-label=\\"Label\\" mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root></mk-test>"',
  );
});

it('should forward props', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: `mk-test`,
      props: { foo: 10 },
    });

    override render() {
      return <div>{this.$props.foo()}</div>;
    }
  }

  const ReactComponent = createReactElement(TestComponent);
  const Root = React.createElement(ReactComponent, { foo: 20 });
  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div><!$>20</div></shadow-root></mk-test>"',
  );
});

it('should forward context map to maverick element', () => {
  const Context = createContext(() => 0);

  class ParentComponent extends Component {
    static el = defineElement({ tagName: `mk-parent` });
    constructor(instance) {
      super(instance);
      provideContext(Context, 1);
    }
  }

  class ChildComponent extends Component {
    static el = defineElement({ tagName: `mk-child` });

    protected _value = 0;

    constructor(instance) {
      super(instance);
      this._value = useContext(Context);
    }

    override render() {
      return this._value;
    }
  }

  const ReactParentComponent = createReactElement(ParentComponent);
  const ReactChildComponent = createReactElement(ChildComponent);

  const Root = React.createElement(
    ReactParentComponent,
    {},
    React.createElement('div', {}, React.createElement(ReactChildComponent)),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<mk-parent mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root><div><mk-child mk-h=\\"\\" mk-d=\\"\\"><shadow-root>1</shadow-root></mk-child></div></mk-parent>"',
  );
});

it('should forward context to react element', () => {
  const Context = createContext(() => 0);

  class ParentComponent extends Component {
    static el = defineElement({ tagName: `mk-parent` });
    constructor(instance) {
      super(instance);
      provideContext(Context, 10);
    }
  }

  const ReactParentComponent = createReactElement(ParentComponent);

  function ReactChildComponent() {
    const value = useReactContext(Context);
    return React.createElement('div', { id: 'react' }, value);
  }

  const Root = React.createElement(
    'div',
    {},
    React.createElement(ReactParentComponent, null, React.createElement(ReactChildComponent)),
  );

  expect(renderToString(Root)).toMatchInlineSnapshot(
    '"<div><mk-parent mk-h=\\"\\" mk-d=\\"\\"><shadow-root></shadow-root><div id=\\"react\\">10</div></mk-parent></div>"',
  );
});
