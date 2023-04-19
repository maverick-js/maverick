import { CustomElement, HostElement } from 'maverick.js';

import { Component, defineElement } from 'maverick.js/element';
import { renderToString } from 'maverick.js/ssr';

it('should render attributes', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    override render() {
      return <HostElement foo="..." $class:foo={true} $style:display={'none'} />;
    }
  }

  const result = renderToString(() => <CustomElement $this={TestComponent} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\" foo=\\"...\\" class=\\"foo\\" style=\\"display: none;\\"><shadow-root></shadow-root></mk-test>"',
  );
});

it('should render with children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    override render() {
      return (
        <HostElement>
          <div>Foo</div>
          <div>Bar</div>
        </HostElement>
      );
    }
  }

  const result = renderToString(() => <CustomElement $this={TestComponent} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Foo</div><!$><div>Bar</div><!/[]></shadow-root></mk-test>"',
  );
});

it('should render with attributes and children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    override render() {
      return (
        <HostElement foo="...">
          <div>{2 > 1 && 'Text'}</div>
          <div>Bar</div>
        </HostElement>
      );
    }
  }

  const result = renderToString(() => <CustomElement $this={TestComponent} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\" foo=\\"...\\"><shadow-root><!$><div><!$>Text</div><!$><div>Bar</div><!/[]></shadow-root></mk-test>"',
  );
});
