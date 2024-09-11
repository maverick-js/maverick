// fragment component
import { ssr } from '../../transform';

test('no children', () => {
  expect(ssr(`<></>`)).toMatchInlineSnapshot(`
    "null;
    "
  `);
});

test('one static child element', () => {
  expect(ssr(`<><div /></>`)).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

test('multiple static child elements', () => {
  expect(ssr(`<><div /><span /></>`)).toMatchInlineSnapshot(`
    ""<div></div><span></span>";
    "
  `);
});

test('one dynamic child element', () => {
  expect(ssr(`<><div on:click={onClick} /></>`)).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(ssr(`<><div on:click={onA} /><span on:click={onB} /></>`)).toMatchInlineSnapshot(`
    ""<div></div><span></span>";
    "
  `);
});

test('one static child expression', () => {
  expect(ssr(`<>{"foo"}</>`)).toMatchInlineSnapshot(`
    ""foo";
    "
  `);
});

test('one dynamic child expression', () => {
  expect(ssr(`<>{a()}</>`)).toMatchInlineSnapshot(`
    "import { $$_escape } from "@maverick-js/ssr";
    $$_escape(a());
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(ssr(`<>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</>`))
    .toMatchInlineSnapshot(`
      "[a() ? "<div></div>" : null, b() ? "<span></span>" : null];
      "
    `);
});

test('import', () => {
  expect(
    ssr(`
import { Fragment } from "maverick.js";

<Fragment slot="apples">
  <div></div>
  <span></span>
</Fragment>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, Fragment } from "@maverick-js/ssr";
    $$_create_component(Fragment, null, {
        "default": () => "<div></div><span></span>"
    });
    "
  `);
});
