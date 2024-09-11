import { dom } from '../../transform';

test('simple', () => {
  expect(dom(`<Foo />`)).toMatchInlineSnapshot(`
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
  expect(dom(`<Foo>Hello</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => "Hello"
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('one static child element', () => {
  expect(dom(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<span></span>");
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_clone($_t_1)
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static child elements', () => {
  expect(dom(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<span></span>"), $_t_2 = $_t_1;
    function $$_fragment_1() {
        return [$$_clone($_t_1), $$_clone($_t_2)];
    }
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1()
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child element', () => {
  expect(dom(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<span></span>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $1);
        return $_r_1;
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
  expect(dom(`<Foo><span on:click={onA} /><span on:click={onB} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_component, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<span></span>"), $_t_2 = $_t_1;
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $1);
        return $_r_1;
    }
    function $$_render_2({ $2 }) {
        let $_r_2 = $$_clone($_t_2);
        $$_listen($_r_2, "click", $2);
        return $_r_2;
    }
    function $$_fragment_1({ $1, $2 }) {
        return [$$_render_1({ $1 }), $$_render_2({ $2 })];
    }
    function $$_render_3({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1({ $1, $2 })
        });
        return $_c_1;
    }
    $$_render_3({ $1: onA, $2: onB });
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(dom(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => "foo"
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child expression', () => {
  expect(dom(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, {
            "default": () => $1
        });
        return $_c_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    dom(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_listen, $$_clone, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<span></span>");
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_listen($_c_1, "click", $1);
        return $_c_1;
    }
    function $$_render_2({ $3 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $3);
        return $_r_1;
    }
    function $$_fragment_1({ $2, $4 }) {
        return [$2, $4];
    }
    function $$_render_3({ $2, $4 }) {
        let $_c_2 = $$_create_component(Foo, null, {
            "default": () => $$_fragment_1({ $2, $4 })
        });
        return $_c_2;
    }
    $$_render_3({ $2: a() ? $$_render_1({ $1: onA }) : null, $4: b() ? $$_render_2({ $3: onB }) : null });
    $$_delegate_events(["click"]);
    "
  `);
});
