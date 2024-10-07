// fragment component
import { react } from '../../transform';

test('no children', () => {
  expect(
    react(`
function Foo() {
  return <></>
}
`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h } from "@maverick-js/react";
    function Foo() {
        return $$_h(ReactFragment);
    }
    "
  `);
});

test('one static child element', () => {
  expect(
    react(`
function Foo() {
  return <><div /></>
}`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div");
    function Foo() {
        return $$_h(ReactFragment, null, $_static_node_1);
    }
    "
  `);
});

test('multiple static child elements', () => {
  expect(
    react(`
function Foo() {
  return <><div /><span /></>
}`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("span");
    function Foo() {
        return $$_h(ReactFragment, null, $_static_node_1, $_static_node_2);
    }
    "
  `);
});

test('one dynamic child element', () => {
  expect(
    react(`
function Foo() {
  return <><div on:click={onClick} /></>
}`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_listen } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_listen(el, "click", onClick);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h(ReactFragment, null, $$_h("div", {
                ref: $_ref_1
            }));
        }
        return $_node_1;
    }
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(
    react(`
function Foo() {
  return <><div on:click={onA} /><span on:click={onB} /></>
}`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_attach, $$_h } from "@maverick-js/react";
    import { $$_listen } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_listen(el, "click", onA);
        }
        function $_attach_2(el) {
            $$_listen(el, "click", onB);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1), $_ref_2 = $$_attach($_attach_2);
            return $$_h(ReactFragment, null, $$_h("div", {
                ref: $_ref_1
            }), $$_h("span", {
                ref: $_ref_2
            }));
        }
        return $_node_1;
    }
    "
  `);
});

test('one static child expression', () => {
  expect(
    react(`
function Foo() {
  return <>{"foo"}</>
}`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h } from "@maverick-js/react";
    function Foo() {
        return $$_h(ReactFragment, null, "foo");
    }
    "
  `);
});

test('one dynamic child expression', () => {
  expect(
    react(`
function Foo() {
  return <>{a()}</>
}`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_computed, $$_expression, $$_h } from "@maverick-js/react";
    function Foo() {
        let $_computed_1 = $$_computed(a), $_node_1 = $$_h($_render_1);
        function $_render_1() {
            let $_expression_1 = $$_expression($_computed_1);
            return $$_h(ReactFragment, null, $_expression_1);
        }
        return $_node_1;
    }
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    react(`
function Foo() {
  return <>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</>
}
`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_attach, $$_h, $$_computed, $$_expression } from "@maverick-js/react";
    import { $$_listen } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1), $_computed_1 = $$_computed(() => a() ? $_node_1 : null), $_node_2 = $$_h($_render_2), $_computed_2 = $$_computed(() => b() ? $_node_2 : null), $_node_3 = $$_h($_render_3);
        function $_attach_1(el) {
            $$_listen(el, "click", onA);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ref: $_ref_1
            });
        }
        function $_attach_2(el) {
            $$_listen(el, "click", onB);
        }
        function $_render_2() {
            let $_ref_2 = $$_attach($_attach_2);
            return $$_h("span", {
                ref: $_ref_2
            });
        }
        function $_render_3() {
            let $_expression_1 = $$_expression($_computed_1), $_expression_2 = $$_expression($_computed_2);
            return $$_h(ReactFragment, null, $_expression_1, $_expression_2);
        }
        return $_node_3;
    }
    "
  `);
});

test('import', () => {
  expect(
    react(`
import { Fragment } from "maverick.js";

function Foo() {
 return (
    <Fragment slot="apples">
      <div></div>
      <span></span>
    </Fragment>
  );
}
`),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h, $$_component, Fragment } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("span");
    function Foo() {
        let $_component_1 = $$_component(Fragment, null, null, {
            "default": () => $$_h(ReactFragment, null, $_static_node_1, $_static_node_2)
        });
        return $_component_1;
    }
    "
  `);
});
