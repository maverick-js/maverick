import {
  Component,
  createComponent,
  createServerElement,
  css,
  defineElement,
  registerCustomElement,
} from 'maverick.js/element';
import { renderToString } from 'maverick.js/ssr';

it('should render', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test-1' });
    override render() {
      return <div class="foo">Test</div>;
    }
  }

  registerCustomElement(TestComponent);

  const result = renderToString(() => <mk-test-1 />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test-1 mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root></mk-test-1>"',
  );
});

it('should render with children', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test-2' });
    override render() {
      return <div class="foo">Test</div>;
    }
  }

  registerCustomElement(TestComponent);

  const result = renderToString(() => (
    <mk-test-2>
      <div>Child</div>
    </mk-test-2>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test-2 mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root><!$><div>Child</div></mk-test-2>"',
  );
});

it('should render with shadow dom', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test-3', shadowRoot: true });
    override render() {
      return <div class="foo">Test</div>;
    }
  }

  registerCustomElement(TestComponent);

  const result = renderToString(() => (
    <mk-test-3>
      <div>Light A</div>
      <div>Light B</div>
      <div>Light C</div>
    </mk-test-3>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test-3 mk-h=\\"\\" mk-d=\\"\\"><template shadowroot=\\"open\\"><!$><div class=\\"foo\\">Test</div></template><!$><div>Light A</div><!$><div>Light B</div><!$><div>Light C</div><!/[]></mk-test-3>"',
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
    static el = defineElement({ tagName: 'mk-test-4' });
  }

  registerCustomElement(TestComponent);

  const result = renderToString(() => (
    <mk-test-4
      foo={10}
      bar={'boo'}
      $class:foo={true}
      $class:bar={true}
      $style:display={'none'}
      $cssvar:baz={10}
    />
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test-4 foo=\\"10\\" bar=\\"boo\\" mk-h=\\"\\" mk-d=\\"\\" class=\\"foo bar\\" style=\\"display: none;--baz: 10;\\"></mk-test-4>"',
  );
});

it('should forward props', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test-5', props: { foo: 10 } });
    override render() {
      return <div>{this.$props.foo()}</div>;
    }
  }

  registerCustomElement(TestComponent);

  const result = renderToString(() => <mk-test-5 $prop:foo={100} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test-5 mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div><!$>100</div></shadow-root></mk-test-5>"',
  );
});

it('should set inner html', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: 'mk-test-6' });
    override render() {
      return <div>Test</div>;
    }
  }

  registerCustomElement(TestComponent);

  const result = renderToString(() => (
    <mk-test-6 $prop:innerHTML={`<div>INNER HTML</div>`}>
      <div>Foo</div>
    </mk-test-6>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-test-6 mk-h=\\"\\" mk-d=\\"\\"><div>INNER HTML</div></mk-test-6>"',
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
