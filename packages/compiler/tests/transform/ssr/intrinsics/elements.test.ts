// fragment component
import { ssr } from '../../transform';

test('no children', () => {
  expect(ssr(`<div></div>`)).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

test('text child', () => {
  expect(ssr(`<div>Foo</div>`)).toMatchInlineSnapshot(`
    ""<div>Foo</div>";
    "
  `);
});

test('one static child element', () => {
  expect(ssr(`<div><span /></div>`)).toMatchInlineSnapshot(`
    ""<div><span></span></div>";
    "
  `);
});

test('multiple static child elements', () => {
  expect(ssr(`<div><span></span><span></span></div>`)).toMatchInlineSnapshot(`
    ""<div><span></span><span></span></div>";
    "
  `);
});

test('one dynamic child element', () => {
  expect(ssr(`<div><span on:click={onClick} /></div>`)).toMatchInlineSnapshot(`
    ""<div><span></span></div>";
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(ssr(`<div><span on:click={onA} /><span on:click={onB} /></div>`)).toMatchInlineSnapshot(`
    ""<div><span></span><span></span></div>";
    "
  `);
});

test('one static child expression', () => {
  expect(ssr(`<div>{"foo"}</div>`)).toMatchInlineSnapshot(`
    ""<div>foo</div>";
    "
  `);
});

test('one dynamic child expression', () => {
  expect(ssr(`<div>{a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<div>", "</div>"];
    $$_ssr($$_t_1, [$$_escape(a())]);
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    ssr(`<div>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<div>", "</div>"];
    $$_ssr($$_t_1, [a() ? "<div></div>" : null, b() ? "<span></span>" : null]);
    "
  `);
});
