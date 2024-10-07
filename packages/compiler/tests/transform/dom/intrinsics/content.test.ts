import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<div innerHTML="<div></div>"><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><div></div></div>");
    $_template_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<div innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_content, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_content($_root_1, "innerHTML", $1);
        return $_root_1;
    }
    $$_render_1({ $1: content });
    "
  `);
});

test('signal', () => {
  expect(dom(`<div $innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_content, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_content($_root_1, "innerHTML", $1);
        return $_root_1;
    }
    $$_render_1({ $1: content });
    "
  `);
});
