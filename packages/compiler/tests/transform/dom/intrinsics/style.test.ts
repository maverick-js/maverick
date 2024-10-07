import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<svg style:color="blue"/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_root_1 = $_template_1();
        $$_style($_root_1, "color", "blue");
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<svg style:color="blue" style:backgroundColor="red"/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_root_1 = $_template_1();
        $$_style($_root_1, "color", "blue");
        $$_style($_root_1, "backgroundColor", "red");
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<svg style:color={getColor()} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_style($_root_1, "color", $1);
        return $_root_1;
    }
    $$_render_1({ $1: getColor() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<svg style:color={getColor()} style:backgroundColor={getBgColor()}/>`))
    .toMatchInlineSnapshot(`
      "import { $$_style, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
      function $$_render_1({ $1, $2 }) {
          let $_root_1 = $_template_1();
          $$_style($_root_1, "color", $1);
          $$_style($_root_1, "backgroundColor", $2);
          return $_root_1;
      }
      $$_render_1({ $1: getColor(), $2: getBgColor() });
      "
    `);
});

test('signal', () => {
  expect(dom(`<svg $style:color={color} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_style($_root_1, "color", $1);
        return $_root_1;
    }
    $$_render_1({ $1: color });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<svg $style:color={color} $style:backgroundColor={bgColor}/>`))
    .toMatchInlineSnapshot(`
      "import { $$_style, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
      function $$_render_1({ $1, $2 }) {
          let $_root_1 = $_template_1();
          $$_style($_root_1, "color", $1);
          $$_style($_root_1, "backgroundColor", $2);
          return $_root_1;
      }
      $$_render_1({ $1: color, $2: bgColor });
      "
    `);
});

test('with dynamic base', () => {
  expect(dom(`<svg style={styles} $style:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_attr, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $_template_1();
        $$_attr($_root_1, "style", $1);
        $$_style($_root_1, "foo", $2);
        return $_root_1;
    }
    $$_render_1({ $1: styles, $2: foo });
    "
  `);
});

test('with signal base', () => {
  expect(dom(`<svg $style={$styles} $style:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_style_tokens, $$_style, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $_template_1();
        $$_style_tokens($_root_1, $1);
        $$_style($_root_1, "foo", $2);
        return $_root_1;
    }
    $$_render_1({ $1: $styles, $2: foo });
    "
  `);
});
