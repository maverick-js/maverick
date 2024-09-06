import { domH } from '../../transform';

test('simple', () => {
  expect(domH(`<Foo />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo);
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('text child', () => {
  expect(domH(`<Foo>Foo</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => "Foo"
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('one static child element', () => {
  expect(domH(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><span></span>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    function $$_render_2() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_render_1()
        });
        return $_c_1;
    }
    $$_render_2();
    "
  `);
});

test('multiple static child elements', () => {
  expect(domH(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><span></span>"), $_t_2 = $_t_1;
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    function $$_render_2() {
        let [$_r, $_w] = $$_create_walker($_t_2);
        return $_r;
    }
    function $$_fragment_1() {
        return [$$_render_1(), $$_render_2()];
    }
    function $$_render_3() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1()
        });
        return $_c_1;
    }
    $$_render_3();
    "
  `);
});

test('one dynamic child element', () => {
  expect(domH(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let [$_r, $_w] = $$_create_walker($_t_1);
        $$_listen($_r, "click", $1);
        return $_r;
    }
    function $$_render_2({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_render_1({ $1 })
        });
        return $_c_1;
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
    let $_t_1 = $$_create_template("<!$><span><!$><div></div></span>"), $_t_2 = $$_create_template("<!$><span></span>");
    function $$_render_1({ $1, $2 }) {
        let [$_r, $_w] = $$_create_walker($_t_1), $_e_1 = $$_next_element($_w);
        $$_listen($_r, "click", $1);
        $$_listen($_e_1, "click", $2);
        return $_r;
    }
    function $$_render_2({ $3 }) {
        let [$_r, $_w] = $$_create_walker($_t_2);
        $$_listen($_r, "click", $3);
        return $_r;
    }
    function $$_fragment_1({ $1, $2, $3 }) {
        return [$$_render_1({ $1, $2 }), $$_render_2({ $3 })];
    }
    function $$_render_3({ $1, $2, $3 }) {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1({ $1, $2, $3 })
        });
        return $_c_1;
    }
    $$_render_3({ $1: onA, $2: onB, $3: onC });
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(domH(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => null
        });
        return $_c_1;
    }
    $$_render_1({ $1: "foo" });
    "
  `);
});

test('one dynamic child expression', () => {
  expect(domH(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => null
        });
        return $_c_1;
    }
    $$_render_1({ $1: () => a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    domH(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_listen, $$_create_walker, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_listen($_c_1, "click", $1);
        return $_c_1;
    }
    function $$_render_2({ $2 }) {
        let [$_r, $_w] = $$_create_walker($_t_1);
        $$_listen($_r, "click", $2);
        return $_r;
    }
    function $$_fragment_1({ $5, $6 }) {
        return [$3, $4];
    }
    function $$_render_3({ $5, $6 }) {
        let $_c_2 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1({ $5, $6 })
        });
        return $_c_2;
    }
    $$_render_3({ $5: () => a() ? $$_render_1({ $1: onA }) : null, $6: () => b() ? $$_render_2({ $2: onB }) : null });
    $$_delegate_events(["click"]);
    "
  `);
});
