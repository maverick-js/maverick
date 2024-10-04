import { react } from '../../transform';

test('simple', () => {
  expect(react(`<Foo />`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo);
    $_component_1
    "
  `);
});

test('text child', () => {
  expect(react(`<Foo>Hello</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => "Hello"
    });
    $_component_1
    "
  `);
});

test('one static child element', () => {
  expect(react(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("span");
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_static_node_1
    });
    $_component_1
    "
  `);
});

test('multiple static child elements', () => {
  expect(react(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("span"), $_static_node_2 = /* @__PURE__ */ $$_h("span");
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => $$_h(ReactFragment, null, $_static_node_1, $_static_node_2)
    });
    $_component_1
    "
  `);
});

test('one dynamic child element', () => {
  expect(react(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h, $$_component } from "@maverick-js/react";
    import { $$_listen, $$_delegate_events } from "@maverick-js/dom";
    let $_node_1 = $$_h($_render_1), $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_node_1
    });
    function $_attach_1(el) {
        $$_listen(el, "click", onClick);
    }
    function $_render_1() {
        let $_ref_1 = $$_attach($_attach_1);
        return $$_h("span", {
            ref: $_ref_1
        });
    }
    $_component_1
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(react(`<Foo><span on:click={onA} /><span on:click={onB} /></Foo>`)).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_attach, $$_h, $$_component } from "@maverick-js/react";
    import { $$_listen, $$_delegate_events } from "@maverick-js/dom";
    let $_node_1 = $$_h($_render_1), $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_node_1
    });
    function $_attach_1(el) {
        $$_listen(el, "click", onA);
    }
    function $_attach_2(el) {
        $$_listen(el, "click", onB);
    }
    function $_render_1() {
        let $_ref_1 = $$_attach($_attach_1), $_ref_2 = $$_attach($_attach_2);
        return $$_h(ReactFragment, null, $$_h("span", {
            ref: $_ref_1
        }), $$_h("span", {
            ref: $_ref_2
        }));
    }
    $_component_1
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(react(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => "foo"
    });
    $_component_1
    "
  `);
});

test('one dynamic child expression', () => {
  expect(react(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_computed, $$_expression, $$_h, $$_component } from "@maverick-js/react";
    let $_computed_1 = $$_computed(a), $_node_1 = $$_h($_render_1), $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_node_1
    });
    function $_render_1() {
        let $_expression_1 = $$_expression($_computed_1);
        return $_expression_1;
    }
    $_component_1
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    react(
      `
function Bar() {
  return <Foo>{a() ? <div><Bar on:click={onA} /></div> : null}{b() ? <span on:click={onB} /> : null}</Foo>
}
      `,
    ),
  ).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_IS_CLIENT, $$_component, $$_memo, $$_h, $$_computed, $$_expression, $$_attach } from "@maverick-js/react";
    import { $$_listen, $$_delegate_events } from "@maverick-js/dom";
    function Bar() {
        let $_node_1 = $$_h($_render_1), $_computed_1 = $$_computed(() => a() ? $_node_1 : null), $_node_2 = $$_h($_render_2), $_computed_2 = $$_computed(() => b() ? $_node_2 : null), $_node_3 = $$_h($_render_3), $_component_1 = $$_component(Foo, null, null, {
            "default": () => $_node_3
        });
        function $_render_1() {
            let $_component_2 = $$_memo(() => $$_component(Bar, null, $$_IS_CLIENT && (instance => {
                $$_listen(instance, "click", onA);
            })));
            return $$_h("div", null, $_component_2);
        }
        function $_attach_1(el) {
            $$_listen(el, "click", onB);
        }
        function $_render_2() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("span", {
                ref: $_ref_1
            });
        }
        function $_render_3() {
            let $_expression_1 = $$_expression($_computed_1), $_expression_2 = $$_expression($_computed_2);
            return $$_h(ReactFragment, null, $_expression_1, $_expression_2);
        }
        return $_component_1;
    }
    $$_delegate_events(["click"]);
    "
  `);
});
