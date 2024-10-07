import { dom } from '../../transform';

test('text', () => {
  expect(dom('<Foo>Hello</Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => "Hello"
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('single static element in default slot', () => {
  expect(dom('<Foo><div /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $_template_1
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('single static element in named slot', () => {
  expect(dom('<Foo><div slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "foo": $_template_1
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('single dynamic element in default slot', () => {
  expect(dom('<Foo><div on:click /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $2 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "click", $2);
        return $_root_1;
    }
    function $$_render_2({ $1, $2 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => $$_render_1({ $2 })
        });
        return $_component_1;
    }
    $$_render_2({ $1: Foo, $2: true });
    "
  `);
});

test('single dynamic element in named slot', () => {
  expect(dom('<Foo><div on:click slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $2 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "click", $2);
        return $_root_1;
    }
    function $$_render_2({ $1, $2 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "foo": () => $$_render_1({ $2 })
        });
        return $_component_1;
    }
    $$_render_2({ $1: Foo, $2: true });
    "
  `);
});

test('multiple static elements in default slot', () => {
  expect(dom('<Foo><div /><span /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<span></span>");
    function $$_fragment_1() {
        return [$_template_1(), $_template_2()];
    }
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('multiple static elements in named slot', () => {
  expect(dom('<Foo><div slot="foo" /><span slot="bar" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<span></span>");
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "foo": $_template_1,
            "bar": $_template_2
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('default namespaced slot', () => {
  expect(dom('<Foo><Foo.Slot><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $_template_1
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('named namespaced slot', () => {
  expect(dom('<Foo><Foo.Slot name="foo"><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "foo": $_template_1
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('multiple named namespaced slot', () => {
  expect(
    dom(
      '<Foo><Foo.Slot name="foo"><div /></Foo.Slot><Foo.Slot name="bar"><div /></Foo.Slot></Foo>',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1;
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "foo": $_template_1,
            "bar": $_template_2
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('fragment default slot', () => {
  expect(dom(`<Foo><Fragment><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1;
    function $$_fragment_1() {
        return [$_template_1(), $_template_2()];
    }
    function $$_render_1({ $2 }) {
        let $_component_1 = $$_create_component($2, null, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    function $$_render_2({ $1, $2 }) {
        let $_component_2 = $$_create_component($1, null, null, {
            "default": () => $$_render_1({ $2 })
        });
        return $_component_2;
    }
    $$_render_2({ $1: Foo, $2: Fragment });
    "
  `);
});

test('fragment named slot', () => {
  expect(dom(`<Foo><Fragment slot="foo"><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1;
    function $$_fragment_1() {
        return [$_template_1(), $_template_2()];
    }
    function $$_render_1({ $2 }) {
        let $_component_1 = $$_create_component($2, null, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    function $$_render_2({ $1, $2 }) {
        let $_component_2 = $$_create_component($1, null, null, {
            "foo": () => $$_render_1({ $2 })
        });
        return $_component_2;
    }
    $$_render_2({ $1: Foo, $2: Fragment });
    "
  `);
});

test('render function', () => {
  expect(dom(`<Foo>{(props) => <div>{props.foo}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_insert, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $2 }) {
        let $_root_1 = $_template_1();
        $$_insert($_root_1, $2);
        return $_root_1;
    }
    function $$_render_2({ $1, $3 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $3
        });
        return $_component_1;
    }
    $$_render_2({ $1: Foo, $3: (props) => $$_render_1({ $2: props.foo }) });
    "
  `);
});

test('render function with multiple expressions', () => {
  expect(
    dom(`
      <Foo>
        {({ a, b, $c }) => (
          <span>
            {a} - {b} - {$c}
          </span>
        )}
      </Foo>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_insert, $$_child, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<span> - <!> - </span>");
    function $$_render_1({ $2, $3, $4 }) {
        let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild, $_node_2 = $$_child($_root_1, 1);
        $$_insert($_root_1, $2, $_node_1);
        $$_insert($_root_1, $3, $_node_2);
        $$_insert($_root_1, $4, null);
        return $_root_1;
    }
    function $$_render_2({ $1, $5 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $5
        });
        return $_component_1;
    }
    $$_render_2({ $1: Foo, $5: ({ a, b, $c }) => ($$_render_1({ $2: a, $3: b, $4: $c })) });
    "
  `);
});
