import { dom } from '../../transform';

test('on', () => {
  expect(dom('<div on:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('capture', () => {
  expect(dom('<div on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "click", $1, true);
        return $_root_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('multiple', () => {
  expect(dom('<div on:pointerdown={onDown} on:pointerup={onUp}  />')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "pointerdown", $1);
        $$_listen($_root_1, "pointerup", $2);
        return $_root_1;
    }
    $$_render_1({ $1: onDown, $2: onUp });
    "
  `);
});
