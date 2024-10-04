import { react } from '../../transform';

test('static', () => {
  expect(
    react(`
function Foo() {
  return <svg class:foo={true} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg", {
        className: "foo"
    });
    function Foo() {
        return $_static_node_1;
    }
    "
  `);
});

test('multiple static', () => {
  expect(
    react(`
function Foo() {
  return <svg class:foo={true} class:bar={false} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg", {
        className: "foo"
    });
    function Foo() {
        return $_static_node_1;
    }
    "
  `);
});

test('dynamic base', () => {
  expect(
    react(`
function Foo() {
  return <svg class={classList} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr_class, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            className: $$_ssr_class(classList)
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "class", classList);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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

test('signal base', () => {
  expect(
    react(`
function Foo() {
  return <svg $class={classList} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_class, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            className: $$_ssr_class($$_unwrap(classList))
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "class", classList);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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

test('dynamic', () => {
  expect(
    react(`
function Foo() {
  return <svg class:foo={isFoo()} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr_class, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            className: $$_ssr_class("", {
                "foo": isFoo()
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo());
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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

test('multiple dynamic', () => {
  expect(
    react(`
function Foo() {
  return <svg class:foo={isFoo()} class:bar={isBar()} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr_class, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            className: $$_ssr_class("", {
                "foo": isFoo(),
                "bar": isBar()
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo());
            $$_class(el, "bar", isBar());
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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

test('signal', () => {
  expect(
    react(`
function Foo() {
  return <svg $class:foo={isFoo} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_class, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            className: $$_ssr_class("", {
                "foo": $$_unwrap(isFoo)
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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

test('multiple signals', () => {
  expect(
    react(`
function Foo() {
  return <svg class="foo" $class:foo={isFoo} $class:bar={isBar} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_class, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            className: $$_ssr_class("foo", {
                "foo": $$_unwrap(isFoo),
                "bar": $$_unwrap(isBar)
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo);
            $$_class(el, "bar", isBar);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
                className: "foo",
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
