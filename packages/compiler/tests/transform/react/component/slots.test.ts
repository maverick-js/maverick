import { react } from '../../transform';

test('text', () => {
  expect(react('<Foo>Hello</Foo>')).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => "Hello"
    });
    $_component_1
    "
  `);
});

test('single static element in default slot', () => {
  expect(react('<Foo><div /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_static_node_1
    });
    $_component_1
    "
  `);
});

test('single static element in named slot', () => {
  expect(react('<Foo><div slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Foo, null, null, {
        "foo": () => $_static_node_1
    });
    $_component_1
    "
  `);
});

test('single dynamic element in default slot', () => {
  expect(react('<Foo><div on:click /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h, $$_component } from "@maverick-js/react";
    import { $$_listen, $$_delegate_events } from "@maverick-js/dom";
    let $_node_1 = $$_h($_render_1), $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_node_1
    });
    function $_attach_1(el) {
        $$_listen(el, "click", true);
    }
    function $_render_1() {
        let $_ref_1 = $$_attach($_attach_1);
        return $$_h("div", {
            ref: $_ref_1
        });
    }
    $_component_1
    $$_delegate_events(["click"]);
    "
  `);
});

test('single dynamic element in named slot', () => {
  expect(react('<Foo><div on:click slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h, $$_component } from "@maverick-js/react";
    import { $$_listen, $$_delegate_events } from "@maverick-js/dom";
    let $_node_1 = $$_h($_render_1), $_component_1 = $$_component(Foo, null, null, {
        "foo": () => $_node_1
    });
    function $_attach_1(el) {
        $$_listen(el, "click", true);
    }
    function $_render_1() {
        let $_ref_1 = $$_attach($_attach_1);
        return $$_h("div", {
            ref: $_ref_1
        });
    }
    $_component_1
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple static elements in default slot', () => {
  expect(react('<Foo><div /><span /></Foo>')).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("span");
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => $$_h(ReactFragment, null, $_static_node_1, $_static_node_2)
    });
    $_component_1
    "
  `);
});

test('multiple static elements in named slot', () => {
  expect(react('<Foo><div slot="foo" /><span slot="bar" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("span");
    let $_component_1 = $$_component(Foo, null, null, {
        "foo": () => $_static_node_1,
        "bar": () => $_static_node_2
    });
    $_component_1
    "
  `);
});

test('default namespaced slot', () => {
  expect(react('<Foo><Foo.Slot><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Foo, null, null, {
        "default": () => $_static_node_1
    });
    $_component_1
    "
  `);
});

test('named namespaced slot', () => {
  expect(react('<Foo><Foo.Slot name="foo"><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Foo, null, null, {
        "foo": () => $_static_node_1
    });
    $_component_1
    "
  `);
});

test('multiple named namespaced slot', () => {
  expect(
    react(
      '<Foo><Foo.Slot name="foo"><div /></Foo.Slot><Foo.Slot name="bar"><div /></Foo.Slot></Foo>',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Foo, null, null, {
        "foo": () => $_static_node_1,
        "bar": () => $_static_node_2
    });
    $_component_1
    "
  `);
});

test('fragment default slot', () => {
  expect(react(`<Foo><Fragment><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Fragment, null, null, {
        "default": () => $$_h(ReactFragment, null, $_static_node_1, $_static_node_2)
    }), $_component_2 = $$_component(Foo, null, null, {
        "default": () => $_component_1
    });
    $_component_2
    "
  `);
});

test('fragment named slot', () => {
  expect(react(`<Foo><Fragment slot="foo"><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { ReactFragment, $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div"), $_static_node_2 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Fragment, null, null, {
        "default": () => $$_h(ReactFragment, null, $_static_node_1, $_static_node_2)
    }), $_component_2 = $$_component(Foo, null, null, {
        "foo": () => $_component_1
    });
    $_component_2
    "
  `);
});

test('render function', () => {
  expect(react(`<Foo>{(props) => <div>{props.foo}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_expression, $$_h, $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": (props) => $$_h($_render_1.bind(props))
    });
    function $_render_1(props) {
        let $_node_1 = $$_expression(props.foo);
        return $$_h("div", null, $_node_1);
    }
    $_component_1
    "
  `);
});

test('render function with nested component', () => {
  expect(
    react(`
<Foo>
  {({ foo, bar }) => (
    <div>
      {foo}
      <Bar>{(bux) => <span>{bux.a}{bar}</span>}</Bar>
    </div>
  )}
</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_expression, $$_h, $$_component, $$_memo } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": ({ foo, bar }) => ($$_h($_render_2.bind(foo, bar)))
    });
    function $_render_1(bux, bar) {
        let $_node_1 = $$_expression(bux.a), $_node_2 = $$_expression(bar);
        return $$_h("span", null, $_node_1, $_node_2);
    }
    function $_render_2(foo, bar) {
        let $_node_3 = $$_expression(foo), $_component_2 = $$_memo(() => $$_component(Bar, null, null, {
            "default": (bux) => $$_h($_render_1.bind(bux, bar))
        }));
        return $$_h("div", null, $_node_3, $_component_2);
    }
    $_component_1
    "
  `);
});

test('render function with binary expression', () => {
  expect(react(`<Foo>{(props) => <div>{props.foo + 10}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_expression, $$_h, $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": (props) => $$_h($_render_1.bind(props))
    });
    function $_render_1(props) {
        let $_node_1 = $$_expression(() => props.foo + 10, [props.foo]);
        return $$_h("div", null, $_node_1);
    }
    $_component_1
    "
  `);
});

test('render function with many args and nested components', () => {
  expect(
    react(
      `
<Foo>
  {(a, b, { c }, [d], e, f, g) => {
    return (
      <div>
        {a}{b}{c}{d}
        <Bar>
          {e.a}
          <span>{f.a}{f.b}</span>
          <Bux>{a.a}{g}{g}</Bux>
          <Hux>{(h) => <div>{a + 10}{a}{e.a}{e.b()}{call(h)}{i}</div>}</Hux>
        </Bar>
      </div>
  }}
</Foo>`,
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_expression, ReactFragment, $$_h, $$_component, $$_memo } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, null, null, {
        "default": (a, b, { c }, [d], e, f, g) => {
            return ($$_h($_render_4.bind(a, b, c, d, e, f, g)));
        }
    });
    function $_render_1(a, g) {
        let $_node_1 = $$_expression(a.a), $_node_2 = $$_expression(g), $_node_3 = $$_expression(g);
        return $$_h(ReactFragment, null, $_node_1, $_node_2, $_node_3);
    }
    function $_render_2(a, e, h) {
        let $_node_4 = $$_expression(() => a + 10, [a]), $_node_5 = $$_expression(a), $_node_6 = $$_expression(e.a), $_node_7 = $$_expression(() => e.b(), [e.b]), $_node_8 = $$_expression(() => call(h), [call, h]), $_node_9 = $$_expression(i);
        return $$_h("div", null, $_node_4, $_node_5, $_node_6, $_node_7, $_node_8, $_node_9);
    }
    function $_render_3(e, f, a, g) {
        let $_node_10 = $$_expression(e.a), $_node_11 = $$_expression(f.a), $_node_12 = $$_expression(f.b), $_component_2 = $$_memo(() => $$_component(Bux, null, null, {
            "default": () => $$_h($_render_1.bind(a, g))
        })), $_component_3 = $$_memo(() => $$_component(Hux, null, null, {
            "default": (h) => $$_h($_render_2.bind(a, e, h))
        }));
        return $$_h(ReactFragment, null, $_node_10, $$_h("span", null, $_node_11, $_node_12), $_component_2, $_component_3);
    }
    function $_render_4(a, b, c, d, e, f, g) {
        let $_node_13 = $$_expression(a), $_node_14 = $$_expression(b), $_node_15 = $$_expression(c), $_node_16 = $$_expression(d), $_component_4 = $$_memo(() => $$_component(Bar, null, null, {
            "default": () => $$_h($_render_3.bind(e, f, a, g))
        }));
        return $$_h("div", null, $_node_13, $_node_14, $_node_15, $_node_16, $_component_4);
    }
    $_component_1
    "
  `);
});

test('render function with many expressions inside elements', () => {
  expect(
    react(`
function Bar() {
  return <Foo>{(a,b) => <div><span>{a}</span><span>{b}</span><span>Static</span></div>}</Foo>
}
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_expression, $$_h, $$_component } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("span", null, "Static");
    function Bar() {
        let $_component_1 = $$_component(Foo, null, null, {
            "default": (a, b) => $$_h($_render_1.bind(a, b))
        });
        function $_render_1(a, b) {
            let $_node_1 = $$_expression(a), $_node_2 = $$_expression(b);
            return $$_h("div", null, $$_h("span", null, $_node_1), $$_h("span", null, $_node_2), $_static_node_1);
        }
        return $_component_1;
    }
    "
  `);
});

test('render function with dynamic root element and no expression', () => {
  expect(
    react(`
function Bar() {
  return <Foo>{() => <div on:click={onClick}>Text</div>}</Foo>
}
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h, $$_component } from "@maverick-js/react";
    import { $$_listen, $$_delegate_events } from "@maverick-js/dom";
    function Bar() {
        let $_node_1 = $$_h($_render_1), $_component_1 = $$_component(Foo, null, null, {
            "default": () => $_node_1
        });
        function $_attach_1(el) {
            $$_listen(el, "click", onClick);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ref: $_ref_1
            }, "Text");
        }
        return $_component_1;
    }
    $$_delegate_events(["click"]);
    "
  `);
});
