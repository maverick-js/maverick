import { domH } from '../../transform';

test('simple', () => {
  expect(domH(`<Foo />`)).toMatchInlineSnapshot(`
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
  expect(domH(`<Foo>Foo</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => "Foo"
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('one static child element', () => {
  expect(domH(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    function $$_render_2({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $$_render_1
        });
        return $_component_1;
    }
    $$_render_2({ $1: Foo });
    "
  `);
});

test('multiple static child elements', () => {
  expect(domH(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span></span>"), $_template_2 = $_template_1;
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    function $$_render_2() {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
        return $_root_2;
    }
    function $$_fragment_1() {
        return [$$_render_1(), $$_render_2()];
    }
    function $$_render_3({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    $$_render_3({ $1: Foo });
    "
  `);
});

test('one dynamic child element', () => {
  expect(domH(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $2 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
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
  expect(
    domH(`<Foo><span on:click={onA}><div on:click={onB} /></span><span on:click={onC} /></Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_next_element, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span><!$><div></div></span>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $2, $3 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_el_1 = $$_next_element($_walker_1);
        $$_listen($_root_1, "click", $2);
        $$_listen($_el_1, "click", $3);
        return $_root_1;
    }
    function $$_render_2({ $4 }) {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
        $$_listen($_root_2, "click", $4);
        return $_root_2;
    }
    function $$_fragment_1({ $2, $3, $4 }) {
        return [$$_render_1({ $2, $3 }), $$_render_2({ $4 })];
    }
    function $$_render_3({ $1, $2, $3, $4 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": () => $$_fragment_1({ $2, $3, $4 })
        });
        return $_component_1;
    }
    $$_render_3({ $1: Foo, $2: onA, $3: onB, $4: onC });
    "
  `);
});

test('one static child expression', () => {
  expect(domH(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
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
  expect(domH(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
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

test('multiple dynamic child expressions', () => {
  expect(
    domH(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component, $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $2, $3 }) {
        let $_component_1 = $$_create_component($3, null, $_target_1 => {
            $$_listen($_target_1, "click", $2);
        });
        return $_component_1;
    }
    function $$_render_2({ $5 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        $$_listen($_root_1, "click", $5);
        return $_root_1;
    }
    function $$_fragment_1({ $4, $6 }) {
        return [$4(), $6()];
    }
    function $$_render_3({ $1, $4, $6 }) {
        let $_component_2 = $$_create_component($1, null, null, {
            "default": () => $$_fragment_1({ $4, $6 })
        });
        return $_component_2;
    }
    $$_render_3({ $1: Foo, $4: () => a() ? $$_render_1({ $2: onA, $3: Foo }) : null, $6: () => b() ? $$_render_2({ $5: onB }) : null });
    "
  `);
});

test('render function', () => {
  expect(domH(`<Foo>{(props) => <div>{props.foo}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><!$></div>");
    function $$_render_1({ $2 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_marker_1 = $_walker_1.nextNode();
        $$_insert_at_marker($_marker_1, $2);
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

test('smoke', () => {
  expect(
    domH(`
<div on:click={onClick}>
  Count is {$count}
  <Child>
    <span>{$count}</span>
    <span>{$count}</span>
  </Child>
  {$count}
</div>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_insert_at_marker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div>Count is <!$><!$><!$></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span><!$></span>"), $_template_3 = $_template_2;
    function $$_render_1({ $4 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_2), $_marker_1 = $_walker_1.nextNode();
        $$_insert_at_marker($_marker_1, $4);
        return $_root_1;
    }
    function $$_render_2({ $5 }) {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_3), $_marker_2 = $_walker_2.nextNode();
        $$_insert_at_marker($_marker_2, $5);
        return $_root_2;
    }
    function $$_fragment_1({ $4, $5 }) {
        return [$$_render_1({ $4 }), $$_render_2({ $5 })];
    }
    function $$_render_3({ $1, $2, $3, $6, $4, $5 }) {
        let [$_root_3, $_walker_3] = $$_create_walker($_template_1), $_marker_3 = $_walker_3.nextNode(), $_marker_4 = $_walker_3.nextNode(), $_component_1 = $$_create_component($3, null, null, {
            "default": () => $$_fragment_1({ $4, $5 })
        }), $_marker_5 = $_walker_3.nextNode();
        $$_listen($_root_3, "click", $1);
        $$_insert_at_marker($_marker_3, $2);
        $$_insert_at_marker($_marker_4, $_component_1);
        $$_insert_at_marker($_marker_5, $6);
        return $_root_3;
    }
    $$_render_3({ $1: onClick, $2: $count, $3: Child, $6: $count, $4: $count, $5: $count });
    "
  `);
});
