import { domH } from '../../transform';

test('simple', () => {
  expect(domH(`<Foo />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo);
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('text child', () => {
  expect(domH(`<Foo>Foo</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => "Foo"
        });
        return $_component_1;
    }
    $$_render_1();
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
    function $$_render_2() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": $$_render_1
        });
        return $_component_1;
    }
    $$_render_2();
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
    function $$_render_3() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    $$_render_3();
    "
  `);
});

test('one dynamic child element', () => {
  expect(domH(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_render_2({ $1 }) {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => $$_render_1({ $1 })
        });
        return $_component_1;
    }
    $$_render_2({ $1: onClick });
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(
    domH(`<Foo><span on:click={onA}><div on:click={onB} /></span><span on:click={onC} /></Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_next_element, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span><!$><div></div></span>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $1, $2 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_el_1 = $$_next_element($_walker_1);
        $$_listen($_root_1, "click", $1);
        $$_listen($_el_1, "click", $2);
        return $_root_1;
    }
    function $$_render_2({ $3 }) {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
        $$_listen($_root_2, "click", $3);
        return $_root_2;
    }
    function $$_fragment_1({ $1, $2, $3 }) {
        return [$$_render_1({ $1, $2 }), $$_render_2({ $3 })];
    }
    function $$_render_3({ $1, $2, $3 }) {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1({ $1, $2, $3 })
        });
        return $_component_1;
    }
    $$_render_3({ $1: onA, $2: onB, $3: onC });
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(domH(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => "foo"
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child expression', () => {
  expect(domH(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component(Foo, null, {
            "default": () => $1
        });
        return $_component_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    domH(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_listen, $$_create_walker, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component(Foo);
        $$_listen($_component_1, "click", $1);
        return $_component_1;
    }
    function $$_render_2({ $3 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        $$_listen($_root_1, "click", $3);
        return $_root_1;
    }
    function $$_fragment_1({ $2, $4 }) {
        return [$2(), $4()];
    }
    function $$_render_3({ $2, $4 }) {
        let $_component_2 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1({ $2, $4 })
        });
        return $_component_2;
    }
    $$_render_3({ $2: () => a() ? $$_render_1({ $1: onA }) : null, $4: () => b() ? $$_render_2({ $3: onB }) : null });
    $$_delegate_events(["click"]);
    "
  `);
});

test('render function', () => {
  expect(domH(`<Foo>{(props) => <div>{props.foo}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><!$></div>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_marker_1 = $_walker_1.nextNode();
        $$_insert_at_marker($_marker_1, $1);
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
