import { CustomElement, HostElement, signal, tick } from 'maverick.js';

import { render } from 'maverick.js/dom';
import { Component, defineElement } from 'maverick.js/element';

let count = 0;

it.skip('should render attributes', () => {
  const foo = signal(1);

  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
    override render() {
      return <HostElement data-foo={foo()} />;
    }
  }

  const root = document.createElement('root');

  render(() => <CustomElement $this={TestComponent} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-1
        data-foo="1"
        mk-d=""
      >
        <shadow-root />
      </mk-test-1>
    </root>
  `);

  foo.set(2);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-1
        data-foo="2"
        mk-d=""
      >
        <shadow-root />
      </mk-test-1>
    </root>
  `);
});

it('should render children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test-${++count}` });
    override render() {
      return (
        <HostElement>
          <div>Foo</div>
          <div>Bar</div>
        </HostElement>
      );
    }
  }

  const root = document.createElement('root');

  render(() => <CustomElement $this={TestComponent} />, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-test-1
        mk-d=""
      >
        <shadow-root>
          <div>
            Foo
          </div>
          <div>
            Bar
          </div>
        </shadow-root>
      </mk-test-1>
    </root>
  `);
});
