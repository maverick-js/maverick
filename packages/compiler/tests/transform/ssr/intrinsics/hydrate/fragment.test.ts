import { ssrH } from '../../../transform';

test('no children', () => {
  expect(ssrH(`<></>`)).toMatchInlineSnapshot(`
    "null;
    "
  `);
});

test('one static child element', () => {
  expect(ssrH(`<><div /></>`)).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

test('multiple static child elements', () => {
  expect(ssrH(`<><div /><span /></>`)).toMatchInlineSnapshot(`
    ""<div></div><span></span>";
    "
  `);
});

test('one dynamic child element', () => {
  expect(ssrH(`<><div on:click={onClick} /></>`)).toMatchInlineSnapshot(`
    ""<!$><div></div>";
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(ssrH(`<><div on:click={onA} /><span on:click={onB} /></>`)).toMatchInlineSnapshot(`
    ""<!$><div></div><!$><span></span>";
    "
  `);
});

test('one static child expression', () => {
  expect(ssrH(`<>{"foo"}</>`)).toMatchInlineSnapshot(`
    ""foo";
    "
  `);
});

test('one dynamic child expression', () => {
  expect(ssrH(`<>{a()}</>`)).toMatchInlineSnapshot(`
    "import { $$_escape } from "@maverick-js/ssr";
    $$_escape(a());
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(ssrH(`<>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</>`))
    .toMatchInlineSnapshot(`
      "[a() ? "<!$><div></div>" : null, b() ? "<!$><span></span>" : null];
      "
    `);
});

test('import', () => {
  expect(
    ssrH(`
import { Fragment } from "maverick.js";

<Fragment slot="apples">
  <div></div>
  <span></span>
</Fragment>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, Fragment } from "@maverick-js/ssr";
    "
  `);
});
