import { dom } from '../../transform';

test('none', () => {
  expect(dom(`<Foo />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1);
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('text child', () => {
  expect(dom(`<Foo>Hello</Foo>`)).toMatchInlineSnapshot(`
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

test('one static child element', () => {
  expect(dom(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<span></span>");
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

test('multiple static child elements', () => {
  expect(dom(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<span></span>"), $_template_2 = $_template_1;
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

test('one dynamic child element', () => {
  expect(dom(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<span></span>");
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
    $$_render_2({ $1: Foo, $2: onClick });
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(dom(`<Foo><span on:click={onA} /><span on:click={onB} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<span></span>"), $_template_2 = $_template_1;
    function $$_render_1({ $2 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "click", $2);
        return $_root_1;
    }
    function $$_render_2({ $3 }) {
        let $_root_2 = $_template_2();
        $$_listen($_root_2, "click", $3);
        return $_root_2;
    }
    function $$_fragment_1({ $2, $3 }) {
        return [$$_render_1({ $2 }), $$_render_2({ $3 })];
    }
    function $$_render_3({ $1, $2, $3 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => $$_fragment_1({ $2, $3 })
        });
        return $_component_1;
    }
    $$_render_3({ $1: Foo, $2: onA, $3: onB });
    "
  `);
});

test('one static child expression', () => {
  expect(dom(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => "foo"
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('one dynamic child expression', () => {
  expect(dom(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => $2
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo, $2: a() });
    "
  `);
});

test('multiple dynamic expressions', () => {
  expect(
    dom(`
  function Foo({ a, $b }) {
    return (
      <div>
        {a}
        {$b}
      </div>
    );
  }

  <Foo a={10} $b={$b} />
`),
  ).toMatchInlineSnapshot(`
    "import { $$_insert, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $_template_1();
        $$_insert($_root_1, $1, null);
        $$_insert($_root_1, $2, null);
        return $_root_1;
    }
    function $$_render_2({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, {
            "a": 10,
            "$b": $1
        });
        return $_component_1;
    }
    function Foo({ a, $b }) {
        return ($$_render_1({ $1: a, $2: $b }));
    }
    $$_render_2({ $1: $b, $2: Foo });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    dom(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<span></span>");
    function $$_render_1({ $2, $3 }) {
        let $_component_1 = $$_create_component($3, null, $_target_1 => {
            $$_listen($_target_1, "click", $2);
        });
        return $_component_1;
    }
    function $$_render_2({ $5 }) {
        let $_root_1 = $_template_1();
        $$_listen($_root_1, "click", $5);
        return $_root_1;
    }
    function $$_fragment_1({ $4, $6 }) {
        return [$4, $6];
    }
    function $$_render_3({ $1, $4, $6 }) {
        let $_component_2 = $$_create_component($1, null, null, {
            "default": () => $$_fragment_1({ $4, $6 })
        });
        return $_component_2;
    }
    $$_render_3({ $1: Foo, $4: a() ? $$_render_1({ $2: onA, $3: Foo }) : null, $6: b() ? $$_render_2({ $5: onB }) : null });
    "
  `);
});

test('child component', () => {
  expect(dom(`<Foo><Bar on:foo={onFoo} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $2, $3 }) {
        let $_component_1 = $$_create_component($3, null, $_target_1 => {
            $$_listen($_target_1, "foo", $2);
        });
        return $_component_1;
    }
    function $$_render_2({ $1, $2, $3 }) {
        let $_component_2 = $$_create_component($1, null, null, {
            "default": () => $$_render_1({ $2, $3 })
        });
        return $_component_2;
    }
    $$_render_2({ $1: Foo, $2: onFoo, $3: Bar });
    "
  `);
});
