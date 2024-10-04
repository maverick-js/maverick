import { react } from '../../transform';

test('static', () => {
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

test('dynamic', () => {
  expect(
    react(`
function Foo() {
  return <div innerHTML={content}><span /></div>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_IS_SERVER, $$_h } from "@maverick-js/react";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            dangerouslySetInnerHTML: { __html: content }
        } : null;
        return $$_h("div", {
            ...$_ssr_attrs_1,
            suppressHydrationWarning: true,
            dangerouslySetInnerHTML: { __html: content }
        });
    }
    "
  `);
});

test('signal', () => {
  expect(
    react(`
function Foo() {
  return <div $innerHTML={content}><span /></div>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_prop } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            dangerouslySetInnerHTML: { __html: $$_unwrap(content) }
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_prop(el, "innerHTML", content);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ...$_ssr_attrs_1,
                suppressHydrationWarning: true,
                ref: $_ref_1
            });
        }
        return $_node_1;
    }
    "
  `);
});
