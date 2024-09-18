import { react } from '../../transform';

test('none', () => {
  expect(
    react(`
function Foo() {
  return <svg />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg");
    function Foo() {
        return $_static_node_1;
    }
    "
  `);
});

test('static', () => {
  expect(
    react(`
function Foo() {
  return <svg width={1920} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg", {
        width: 1920
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
  return <svg width={1920} height={1080} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("svg", {
        width: 1920,
        height: 1080
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
  return <svg width={calcWidth} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "width", calcWidth);
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
  return <svg width={calcWidth} height={calcHeight} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "width", calcWidth);
            $$_attr(el, "height", calcHeight);
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
  return <svg $width={width} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "width", width);
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
  return <svg $width={width} $height={height} />
}`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_attr } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_attr(el, "width", width);
            $$_attr(el, "height", height);
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
