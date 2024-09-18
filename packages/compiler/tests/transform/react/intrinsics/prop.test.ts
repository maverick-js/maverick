import { react } from '../../transform';

test('static', () => {
  expect(
    react(`
function Foo() {
  return <svg prop:width={1920}/>
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_props_1 = /* @__PURE__ */ {
        ref: $_attach_1
    };
    function $_attach_1(el) {
        el.width = 1920;
    }
    function Foo() {
        return $$_h("svg", $_props_1);
    }
    "
  `);
});

test('multiple static', () => {
  expect(
    react(`
function Foo() {
  return <svg prop:width={1920} prop:height={1080} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_h } from "@maverick-js/react";
    let $_props_1 = /* @__PURE__ */ {
        ref: $_attach_1
    };
    function $_attach_1(el) {
        el.width = 1920;
        el.height = 1080;
    }
    function Foo() {
        return $$_h("svg", $_props_1);
    }
    "
  `);
});

test('dynamic', () => {
  expect(
    react(`
function Foo() {
  return <svg prop:width={calcWidth} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            el.width = calcWidth;
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
  return <svg prop:width={calcWidth} prop:height={calcHeight} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            el.width = calcWidth;
            el.height = calcHeight;
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
  return <svg $prop:width={calcWidth} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_prop } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_prop(el, "width", calcWidth);
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
  return <svg $prop:width={calcWidth} $prop:height={calcHeight} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_prop } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_prop(el, "width", calcWidth);
            $$_prop(el, "height", calcHeight);
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
