import { CustomElement } from 'maverick.js';

import {
  createElementInstance,
  createServerElement,
  css,
  defineElement,
  defineProp,
} from 'maverick.js/element';
import { renderToString } from 'maverick.js/ssr';

it('should render custom element', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => <CustomElement $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root></mk-foo>"',
  );
});

it('should render custom element with children', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement $element={element}>
      <div>Child</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div class=\\"foo\\">Test</div></shadow-root><!$><div>Child</div></mk-foo>"',
  );
});

it('should render custom element with shadow dom', () => {
  const element = defineElement({
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
    '"<!$><mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><template shadowroot=\\"open\\"><!$><div class=\\"foo\\">Test</div></template><!$><div>Light A</div><!$><div>Light B</div><!$><div>Light C</div></mk-foo>"',
  );
});

it('should render adopted css styles in shadow root template', () => {
  const Button = defineElement({
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

it('should render custom element with attributes', () => {
  const element = defineElement({ tagName: 'mk-foo' });

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
    '"<!$><mk-foo foo=\\"10\\" bar=\\"boo\\" mk-hydrate=\\"\\" mk-delegate=\\"\\" class=\\"foo bar\\" style=\\"display: none;--baz: 10;\\"><shadow-root></shadow-root></mk-foo>"',
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

  const result = renderToString(() => <CustomElement $prop:foo={100} $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div><!$>100</div></shadow-root></mk-foo>"',
  );
});

it('should forward attrs to props', () => {
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

  const result = renderToString(() => <CustomElement foo={100} $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo foo=\\"100\\" mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div><!$>100</div></shadow-root></mk-foo>"',
  );
});

it('should set inner html', () => {
  const element = defineElement({
    tagName: 'mk-foo-10',
    setup: () => () => <div>Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement $prop:innerHTML={`<div>INNER HTML</div>`} $element={element}>
      <div>Foo</div>
    </CustomElement>
  )).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo-10 mk-hydrate=\\"\\" mk-delegate=\\"\\"><shadow-root><!$><div>Test</div></shadow-root><div>INNER HTML</div></mk-foo-10>"',
  );
});

it('should render css vars', () => {
  const Button = defineElement({
    tagName: `mk-button-5`,
    cssvars: {
      foo: 10,
      bar: 'none',
    },
  });

  const instance = createElementInstance(Button);
  const element = new (createServerElement(Button))();
  element.attachComponent(instance);

  expect(element.style.tokens).toMatchInlineSnapshot(`
    Map {
      "--foo" => "10",
      "--bar" => "none",
    }
  `);
});

it('should render css vars builder', () => {
  const Button = defineElement({
    tagName: `mk-button-6`,
    props: { foo: { initial: 100 } },
    cssvars: (props) => ({
      foo: () => props.foo,
    }),
  });

  const instance = createElementInstance(Button);
  const element = new (createServerElement(Button))();
  element.attachComponent(instance);

  expect(element.style.tokens).toMatchInlineSnapshot(`
    Map {
      "--foo" => "100",
    }
  `);
});
