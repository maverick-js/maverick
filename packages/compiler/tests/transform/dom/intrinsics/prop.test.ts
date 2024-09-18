import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<svg prop:width={1920}/>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_root_1 = $$_clone($_template_1);
        $_root_1.width = 1920;
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<svg prop:width={1920} prop:height={1080} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_root_1 = $$_clone($_template_1);
        $_root_1.width = 1920;
        $_root_1.height = 1080;
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<svg prop:width={calcWidth} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $_root_1.width = $1;
        return $_root_1;
    }
    $$_render_1({ $1: calcWidth });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<svg prop:width={calcWidth} prop:height={calcHeight} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $$_clone($_template_1);
        $_root_1.width = $1;
        $_root_1.height = $2;
        return $_root_1;
    }
    $$_render_1({ $1: calcWidth, $2: calcHeight });
    "
  `);
});

test('signal', () => {
  expect(dom(`<svg $prop:width={calcWidth} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_prop, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_prop($_root_1, "width", $1);
        return $_root_1;
    }
    $$_render_1({ $1: calcWidth });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<svg $prop:width={calcWidth} $prop:height={calcHeight} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_prop, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_prop($_root_1, "width", $1);
        $$_prop($_root_1, "height", $2);
        return $_root_1;
    }
    $$_render_1({ $1: calcWidth, $2: calcHeight });
    "
  `);
});
