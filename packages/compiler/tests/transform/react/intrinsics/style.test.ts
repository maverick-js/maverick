import { react } from '../../transform';

test('static', () => {
  expect(
    react(`
function Foo() {
  return <svg style:color="blue"/>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg", {
        style: {
            color: "blue"
        }
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
  return <svg style:color="blue"/>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg", {
        style: {
            color: "blue"
        }
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
  return <svg style={styles} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            style: $$_ssr_style(styles)
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "style", styles);
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
  return <svg $style={styles} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            style: $$_ssr_style($$_unwrap(styles))
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "style", styles);
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
  return <svg style:color={color} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            style: $$_ssr_style("", {
                "color": color
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_style(el, "color", color);
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
  return <svg style:color={color} style:backgroundColor={bgColor} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            style: $$_ssr_style("", {
                "color": color,
                "backgroundColor": bgColor
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_style(el, "color", color);
            $$_style(el, "backgroundColor", bgColor);
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
  return <svg $style:color={color}/>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            style: $$_ssr_style("", {
                "color": $$_unwrap(color)
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_style(el, "color", color);
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
  return <svg $style:color={color} $style:backgroundColor={bgColor}/>
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    function Foo() {
        let $_ssr_attrs_1 = $$_IS_SERVER ? {
            style: $$_ssr_style("", {
                "color": $$_unwrap(color),
                "backgroundColor": $$_unwrap(bgColor)
            })
        } : null, $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_style(el, "color", color);
            $$_style(el, "backgroundColor", bgColor);
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

test('with dynamic base', () => {
  expect(react(`<svg style={styles} $style:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr, $$_style } from "@maverick-js/dom";
    let $_ssr_attrs_1 = $$_IS_SERVER ? {
        style: $$_ssr_style(styles, {
            "foo": $$_unwrap(foo)
        })
    } : null, $_node_1 = $$_h($_render_1);
    function $_attach_1(el) {
        $$_attr(el, "style", styles);
        $$_style(el, "foo", foo);
    }
    function $_render_1() {
        let $_ref_1 = $$_attach($_attach_1);
        return $$_h("svg", {
            ...$_ssr_attrs_1,
            suppressHydrationWarning: true,
            ref: $_ref_1
        });
    }
    $_node_1
    "
  `);
});

test('with signal base', () => {
  expect(react(`<svg $style={$styles} $style:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_unwrap, $$_ssr_style, $$_IS_SERVER, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_style_tokens, $$_style } from "@maverick-js/dom";
    let $_ssr_attrs_1 = $$_IS_SERVER ? {
        style: $$_ssr_style($$_unwrap($styles), {
            "foo": $$_unwrap(foo)
        })
    } : null, $_node_1 = $$_h($_render_1);
    function $_attach_1(el) {
        $$_style_tokens(el, $styles);
        $$_style(el, "foo", foo);
    }
    function $_render_1() {
        let $_ref_1 = $$_attach($_attach_1);
        return $$_h("svg", {
            ...$_ssr_attrs_1,
            suppressHydrationWarning: true,
            ref: $_ref_1
        });
    }
    $_node_1
    "
  `);
});
