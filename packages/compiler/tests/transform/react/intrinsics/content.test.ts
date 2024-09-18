import { react } from '../../transform';

test('static innerHTML', () => {
  expect(
    react(`
function Foo() {
  return <div innerHTML="<div></div>"><span /></div>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_html, $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div", $$_html("<div></div>"));
    function Foo() {
        return $_static_node_1;
    }
    "
  `);
});

test('static innerHTML', () => {
  expect(
    react(`
function Foo() {
  return <div innerHTML={content}><span /></div>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    function Foo() {
        return $$_h("div", {
            dangerouslySetInnerHTML: { __html: content }
        });
    }
    "
  `);
});

test('$innerHTML', () => {
  expect(
    react(`
function Foo() {
  return <div $innerHTML={content}><span /></div>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_prop } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_prop(el, "innerHTML", content);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ref: $_ref_1
            });
        }
        return $_node_1;
    }
    "
  `);
});
