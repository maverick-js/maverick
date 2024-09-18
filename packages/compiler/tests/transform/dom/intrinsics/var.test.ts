import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<svg var:foo={1}/>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_root_1 = $$_clone($_template_1);
        $$_style($_root_1, "--foo", 1);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<svg var:foo={1} var:bar={2}/>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_root_1 = $$_clone($_template_1);
        $$_style($_root_1, "--foo", 1);
        $$_style($_root_1, "--bar", 2);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<svg var:foo={getFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_style($_root_1, "--foo", $1);
        return $_root_1;
    }
    $$_render_1({ $1: getFoo() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<svg var:foo={getFoo()} var:bar={getBar()}/>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_style($_root_1, "--foo", $1);
        $$_style($_root_1, "--bar", $2);
        return $_root_1;
    }
    $$_render_1({ $1: getFoo(), $2: getBar() });
    "
  `);
});

test('signal', () => {
  expect(dom(`<svg $var:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_style($_root_1, "--foo", $1);
        return $_root_1;
    }
    $$_render_1({ $1: foo });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<svg $var:foo={foo} $var:bar={bar}/>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_style($_root_1, "--foo", $1);
        $$_style($_root_1, "--bar", $2);
        return $_root_1;
    }
    $$_render_1({ $1: foo, $2: bar });
    "
  `);
});
