import { CustomElement } from 'maverick.js';
import { defineElement, property } from 'maverick.js/element';
import { renderToString } from 'maverick.js/ssr';

it('should render custom element', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => <CustomElement element={element} />).code;

  expect(result).toMatchSnapshot();
});

it('should render custom element with children', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement element={element}>
      <div>Child</div>
    </CustomElement>
  )).code;

  expect(result).toMatchSnapshot();
});

it('should render custom element with shadow dom', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    shadow: true,
    setup: () => () => <div class="foo">Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement element={element}>
      <div>Light A</div>
      <div>Light B</div>
      <div>Light C</div>
    </CustomElement>
  )).code;

  expect(result).toMatchSnapshot();
});

it('should render custom element with attributes', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => null,
  });

  const result = renderToString(() => (
    <CustomElement
      foo={10}
      bar={'boo'}
      $class:foo={true}
      $class:bar={true}
      $style:display={'none'}
      $cssvar:baz={10}
      element={element}
    />
  )).code;

  expect(result).toMatchSnapshot();
});

it('should forward props', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    props: {
      foo: property(10),
    },
    setup:
      ({ props }) =>
      () =>
        <div>{props.foo}</div>,
  });

  const result = renderToString(() => <CustomElement $prop:foo={100} element={element} />).code;

  expect(result).toMatchSnapshot();
});

it('should forward attrs to props', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    props: {
      foo: property(10),
    },
    setup:
      ({ props }) =>
      () =>
        <div>{props.foo}</div>,
  });

  const result = renderToString(() => <CustomElement foo={100} element={element} />).code;

  expect(result).toMatchSnapshot();
});

it('should set inner html', () => {
  const element = defineElement({
    tagName: 'mk-foo',
    setup: () => () => <div>Test</div>,
  });

  const result = renderToString(() => (
    <CustomElement $prop:innerHTML={`<div>INNER HTML</div>`} element={element} />
  )).code;

  expect(result).toMatchSnapshot();
});
