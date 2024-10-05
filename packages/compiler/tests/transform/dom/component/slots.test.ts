import { dom } from '../../transform';

test('text', () => {
  expect(dom('<Foo>Hello</Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => "Hello"
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('single static element in default slot', () => {
  expect(dom('<Foo><div /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => $$_clone($_template_1)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('single static element in named slot', () => {
  expect(dom('<Foo><div slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "foo": () => $$_clone($_template_1)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('single dynamic element in default slot', () => {
  expect(dom('<Foo><div on:click /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_render_2({ $1 }) {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => $$_render_1({ $1 })
        });
        return $_component_1;
    }
    $$_render_2({ $1: true });
    $$_delegate_events(["click"]);
    "
  `);
});

test('single dynamic element in named slot', () => {
  expect(dom('<Foo><div on:click slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_render_2({ $1 }) {
        let $_component_1 = $$_create_component(Foo, null, {
            "foo": () => $$_render_1({ $1 })
        });
        return $_component_1;
    }
    $$_render_2({ $1: true });
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple static elements in default slot', () => {
  expect(dom('<Foo><div /><span /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<span></span>");
    function $$_fragment_1() {
        return [$$_clone($_template_1), $$_clone($_template_2)];
    }
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static elements in named slot', () => {
  expect(dom('<Foo><div slot="foo" /><span slot="bar" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<span></span>");
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "foo": () => $$_clone($_template_1),
            "bar": () => $$_clone($_template_2)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('default namespaced slot', () => {
  expect(dom('<Foo><Foo.Slot><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => $$_clone($_template_1)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('named namespaced slot', () => {
  expect(dom('<Foo><Foo.Slot name="foo"><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "foo": () => $$_clone($_template_1)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple named namespaced slot', () => {
  expect(
    dom(
      '<Foo><Foo.Slot name="foo"><div /></Foo.Slot><Foo.Slot name="bar"><div /></Foo.Slot></Foo>',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1;
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "foo": () => $$_clone($_template_1),
            "bar": () => $$_clone($_template_2)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('fragment default slot', () => {
  expect(dom(`<Foo><Fragment><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1;
    function $$_fragment_1() {
        return [$$_clone($_template_1), $$_clone($_template_2)];
    }
    function $$_render_1() {
        let $_component_1 = $$_create_component(Fragment, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    function $$_render_2() {
        let $_component_2 = $$_create_component(Foo, null, {
            "default": $$_render_1
        });
        return $_component_2;
    }
    $$_render_2();
    "
  `);
});

test('fragment named slot', () => {
  expect(dom(`<Foo><Fragment slot="foo"><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1;
    function $$_fragment_1() {
        return [$$_clone($_template_1), $$_clone($_template_2)];
    }
    function $$_render_1() {
        let $_component_1 = $$_create_component(Fragment, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    function $$_render_2() {
        let $_component_2 = $$_create_component(Foo, null, {
            "foo": $$_render_1
        });
        return $_component_2;
    }
    $$_render_2();
    "
  `);
});

test('render function', () => {
  expect(dom(`<Foo>{(props) => <div>{props.foo}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_insert($_root_1, $1);
        return $_root_1;
    }
    function $$_render_2({ $2 }) {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": $2
        });
        return $_component_1;
    }
    $$_render_2({ $2: (props) => $$_render_1({ $1: props.foo }) });
    "
  `);
});