import { ssrH } from '../../../transform';

test('no children', () => {
  expect(ssrH(`<div></div>`)).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

test('text child', () => {
  expect(ssrH(`<div>Foo</div>`)).toMatchInlineSnapshot(`
    ""<div>Foo</div>";
    "
  `);
});

test('one static child element', () => {
  expect(ssrH(`<div><span /></div>`)).toMatchInlineSnapshot(`
    ""<div><span></span></div>";
    "
  `);
});

test('multiple static child elements', () => {
  expect(ssrH(`<div><span></span><span></span></div>`)).toMatchInlineSnapshot(`
    ""<div><span></span><span></span></div>";
    "
  `);
});

test('one dynamic child element', () => {
  expect(ssrH(`<div><span on:click={onClick} /></div>`)).toMatchInlineSnapshot(`
    ""<div><!$><span></span></div>";
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(
    ssrH(`<div><span on:click={onA}><div on:click={onB} /></span><span on:click={onC} /></div>`),
  ).toMatchInlineSnapshot(`
    ""<div><!$><span><!$><div></div></span><!$><span></span></div>";
    "
  `);
});

test('one static child expression', () => {
  expect(ssrH(`<div>{"foo"}</div>`)).toMatchInlineSnapshot(`
    ""<div>foo</div>";
    "
  `);
});

test('one dynamic child expression', () => {
  expect(ssrH(`<div>{a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<div>", "</div>"];
    $$_ssr($$_t_1, [$$_escape(a())]);
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    ssrH(`<div>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<div><!$>", "<!$>", "</div>"];
    $$_ssr($$_t_1, [a() ? "<!$><div></div>" : null, b() ? "<!$><span></span>" : null]);
    "
  `);
});
