import { CustomElement } from 'maverick.js';

import {
  Component,
  createComponent,
  createServerElement,
  css,
  defineElement,
} from 'maverick.js/element';
import { renderToString } from 'maverick.js/ssr';

it('should render', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    override render() {
      return <div class="foo">Test</div>;
    }
  }

  const result = renderToString(() => <CustomElement $this={TestComponent} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root></mk-test>"',
  );
});

it('should render with children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    override render() {
      return <div class="foo">Test</div>;
    }
  }

  const result = renderToString(() => (
    <CustomElement $this={TestComponent}>
      <div>Child</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root><!$><div>Child</div></mk-test>"',
  );
});

it('should render with shadow dom', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test', shadowRoot: true });
    override render() {
      return <div class="foo">Test</div>;
    }
  }

  const result = renderToString(() => (
    <CustomElement $this={TestComponent}>
      <div>Light A</div>
      <div>Light B</div>
      <div>Light C</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\"><template shadowroot=\\"open\\"><!$><div class=\\"foo\\">Test</div></template><!$><div>Light A</div><!$><div>Light B</div><!$><div>Light C</div><!/[]></mk-test>"',
  );
});

it('should render adopted css styles in shadow root template', () => {
  class TestComponent extends Component {
    static el = defineElement({
      tagName: 'mk-test',
      shadowRoot: true,
      css: [
        css`
          div {
            display: inline-block;
          }
        `,
        css`
          .container {
            color: blue;
            order: ${4};
          }
        `,
      ],
    });
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  // Fragile snapshot can't inline.
  expect(host.render()).toMatchSnapshot();
});

it('should render with attributes', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
  }

  const result = renderToString(() => (
    <CustomElement
      foo={10}
      bar={'boo'}
      $class:foo={true}
      $class:bar={true}
      $style:display={'none'}
      $cssvar:baz={10}
      $this={TestComponent}
    />
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test foo=\\"10\\" bar=\\"boo\\" mk-h=\\"\\" mk-d=\\"\\" class=\\"foo bar\\" style=\\"display: none;--baz: 10;\\"></mk-test>"',
  );
});

it('should forward props', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test', props: { foo: 10 } });
    override render() {
      return <div>{this.$props.foo()}</div>;
    }
  }

  const result = renderToString(() => <CustomElement $prop:foo={100} $this={TestComponent} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div><!$>100</div></shadow-root></mk-test>"',
  );
});

it('should set inner html', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    override render() {
      return <div>Test</div>;
    }
  }

  const result = renderToString(() => (
    <CustomElement $prop:innerHTML={`<div>INNER HTML</div>`} $this={TestComponent}>
      <div>Foo</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test mk-h=\\"\\" mk-d=\\"\\"><div>INNER HTML</div></mk-test>"',
  );
});

it('should render `setAttributes`', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    constructor(instance) {
      super(instance);
      this.setAttributes({
        foo: () => 10,
        bar: 'none',
        baz: null,
        bux: false,
      });
    }
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "foo" => "10",
      "bar" => "none",
    }
  `);
});

it('should render `setStyles`', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test' });
    constructor(instance) {
      super(instance);
      this.setStyles({
        flex: '1',
        'flex-basis': null,
        'align-self': false,
        'z-index': () => 10,
      });
    }
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  expect(host.style.tokens).toMatchInlineSnapshot(`
    Map {
      "flex" => "1",
      "z-index" => "10",
    }
  `);
});
