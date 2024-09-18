import { dom } from '../../transform';

test('static innerHTML', () => {
  expect(dom(`<div innerHTML="<div></div>"><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><div></div></div>");
    $$_clone($_template_1);
    "
  `);
});

test('static innerHTML', () => {
  expect(dom(`<div innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $_root_1.innerHTML = $1;
        return $_root_1;
    }
    $$_render_1({ $1: content });
    "
  `);
});

test('$innerHTML', () => {
  expect(dom(`<div $innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_prop, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_prop($_root_1, "innerHTML", $1);
        return $_root_1;
    }
    $$_render_1({ $1: content });
    "
  `);
});
