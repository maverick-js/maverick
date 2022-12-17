import { CustomElement } from 'maverick.js';

import {
  createElementInstance,
  createServerElement,
  css,
  defineCustomElement,
} from 'maverick.js/element';
import { renderToString } from 'maverick.js/ssr';

it('should render', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => <CustomElement $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root></mk-foo>"',
  );
});

it('should render with children', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement $element={element}>
      <div>Child</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root><!$><div>Child</div></mk-foo>"',
  );
});

it('should render with shadow dom', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    shadowRoot: true,
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement $element={element}>
      <div>Light A</div>
      <div>Light B</div>
      <div>Light C</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\"><template shadowroot=\\"open\\"><!$><div class=\\"foo\\">Test</div></template><!$><div>Light A</div><!$><div>Light B</div><!$><div>Light C</div></mk-foo>"',
  );
});

it('should render adopted css styles in shadow root template', () => {
  const Button = defineCustomElement({
    tagName: `mk-button-7`,
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

  const instance = createElementInstance(Button);
  const element = new (createServerElement(Button))();
  element.attachComponent(instance);

  // Fragile snapshot can't inline.
  expect(element.render()).toMatchSnapshot();
});

it('should render with attributes', () => {
  const element = defineCustomElement({ tagName: 'mk-foo' });

  const result = renderToString(() => (
    <CustomElement
      foo={10}
      bar={'boo'}
      $class:foo={true}
      $class:bar={true}
      $style:display={'none'}
      $cssvar:baz={10}
      $element={element}
    />
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo foo=\\"10\\" bar=\\"boo\\" mk-h=\\"\\" mk-d=\\"\\" class=\\"foo bar\\" style=\\"display: none;--baz: 10;\\"></mk-foo>"',
  );
});

it('should forward props', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    // @ts-expect-error
    props: {
      foo: { initial: 10 },
    },
    setup:
      ({ props }) =>
      () =>
        <div>{props.foo}</div>,
  });

  const result = renderToString(() => <CustomElement $prop:foo={100} $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div><!$>100</div></shadow-root></mk-foo>"',
  );
});

it('should set inner html', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo-10',
    setup: () => () => <div>Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement $prop:innerHTML={`<div>INNER HTML</div>`} $element={element}>
      <div>Foo</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo-10 mk-h=\\"\\" mk-d=\\"\\"><div>INNER HTML</div></mk-foo-10>"',
  );
});

it('should render `setAttributes`', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-1`,
    setup({ host }) {
      host.setAttributes({
        foo: () => 10,
        bar: 'none',
        baz: null,
        bux: false,
      });
    },
  });

  const instance = createElementInstance(Foo);
  const element = new (createServerElement(Foo))();
  element.attachComponent(instance);

  expect(element.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "foo" => "10",
      "bar" => "none",
    }
  `);
});

it('should render `setStyles`', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-2`,
    setup({ host }) {
      host.setStyles({
        flex: '1',
        'flex-basis': null,
        'align-self': false,
        'z-index': () => 10,
      });
    },
  });

  const instance = createElementInstance(Foo);
  const element = new (createServerElement(Foo))();
  element.attachComponent(instance);

  expect(element.style.tokens).toMatchInlineSnapshot(`
    Map {
      "flex" => "1",
      "z-index" => "10",
    }
  `);
});

it('should render `setCSSVars`', () => {
  const Foo = defineCustomElement({
    tagName: `mk-foo-3`,
    setup({ host }) {
      host.setCSSVars({
        '--foo': () => 10,
        '--bar': 'none',
        '--baz': false,
        '--bax': null,
      });
    },
  });

  const instance = createElementInstance(Foo);
  const element = new (createServerElement(Foo))();
  element.attachComponent(instance);

  expect(element.style.tokens).toMatchInlineSnapshot(`
    Map {
      "--foo" => "10",
      "--bar" => "none",
    }
  `);
});
