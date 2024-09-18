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

test('dynamic', () => {
  expect(
    react(`
function Foo() {
  return <svg class:foo={isFoo()} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo());
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo());
            $$_class(el, "bar", isBar());
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
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
  return <svg $class:foo={isFoo} $class:bar={isBar} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_class } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_class(el, "foo", isFoo);
            $$_class(el, "bar", isBar);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("svg", {
                ref: $_ref_1
            });
        }
        return $_node_1;
    }
    "
  `);
});
