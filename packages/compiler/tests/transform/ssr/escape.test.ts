import { ssr } from '../transform';

test('logical or with two identifiers', () => {
  expect(ssr(`<div>{a() || b()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a() || b())]);
    "
  `);
});

test('logical or with right element', () => {
  expect(ssr(`<div>{a() || <div />}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a()) || "<div></div>"]);
    "
  `);
});

test('logical or with left element', () => {
  expect(ssr(`<div>{<div /> || a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, ["<div></div>" || $$_escape(a())]);
    "
  `);
});

test('logical or with fragment', () => {
  expect(ssr(`<div>{<><div /></> || a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, ["<div></div>" || $$_escape(a())]);
    "
  `);
});

test('logical and with two identifiers', () => {
  expect(ssr(`<div>{a() && b()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a() && b())]);
    "
  `);
});

test('logical and with element', () => {
  expect(ssr(`<div>{a() && <div />}</div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [a() && "<div></div>"]);
    "
  `);
});

test('logical and with fragment', () => {
  expect(ssr(`<div>{a() && <><div /></>}</div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [a() && "<div></div>"]);
    "
  `);
});

test('conditional expression with true element', () => {
  expect(ssr(`<div>{a() ? <div /> : b()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [a() ? "<div></div>" : $$_escape(b())]);
    "
  `);
});

test('conditional expression with false element', () => {
  expect(ssr(`<div>{a() ? b() : <div />}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [a() ? $$_escape(b()) : "<div></div>"]);
    "
  `);
});

test('conditional expression with fragment', () => {
  expect(ssr(`<div>{a() ? b() : <><div /></>}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [a() ? $$_escape(b()) : "<div></div>"]);
    "
  `);
});

test('conditional expression with undefined/null', () => {
  expect(ssr(`<div>{a() ? undefined : null}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a() ? undefined : null)]);
    "
  `);
});

test('nested conditional expression', () => {
  expect(ssr(`<div>{a() ? <div /> : b() ? <span /> : c()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [a() ? "<div></div>" : b() ? "<span></span>" : $$_escape(c())]);
    "
  `);
});

test('nullish coalescing with identifiers', () => {
  expect(ssr(`<div>{a() ?? b()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a() ?? b())]);
    "
  `);
});

test('nullish coalescing with element', () => {
  expect(ssr(`<div>{a() ?? <div />}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a()) ?? "<div></div>"]);
    "
  `);
});

test('nested nullish coalescing', () => {
  expect(ssr(`<div>{a() ?? <div /> ?? b() ?? c()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<div><!$>", "</div>"];
    $$_ssr($$_template_1, [$$_escape(a()) ?? "<div></div>" ?? $$_escape(b()) ?? $$_escape(c())]);
    "
  `);
});
