import { domH } from '../../../transform';

test('no children', () => {
  expect(domH(`<div></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div></div>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    $$_render_1();
    "
  `);
});

test('text child', () => {
  expect(domH(`<div>Foo</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div>Foo</div>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    $$_render_1();
    "
  `);
});

test('one static child element', () => {
  expect(domH(`<div><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div><span></span></div>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    $$_render_1();
    "
  `);
});

test('multiple static child elements', () => {
  expect(domH(`<div><span></span><span></span></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div><span></span><span></span></div>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child element', () => {
  expect(domH(`<div><span on:click={onClick} /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_next_element, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div><!$><span></span></div>");
    function $$_render_1({ $1 }) {
        let [$_r, $_w] = $$_create_walker($_t_1), $_e_1 = $$_next_element($_w);
        $$_listen($_e_1, "click", $1);
        return $_r;
    }
    $$_render_1({ $1: onClick });
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(
    domH(`<div><span on:click={onA}><div on:click={onB} /></span><span on:click={onC} /></div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_next_element, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div><!$><span><!$><div></div></span><!$><span></span></div>");
    function $$_render_1({ $1, $2, $3 }) {
        let [$_r, $_w] = $$_create_walker($_t_1), $_e_1 = $$_next_element($_w), $_e_2 = $$_next_element($_w), $_e_3 = $$_next_element($_w);
        $$_listen($_e_1, "click", $1);
        $$_listen($_e_2, "click", $2);
        $$_listen($_e_3, "click", $3);
        return $_r;
    }
    $$_render_1({ $1: onA, $2: onB, $3: onC });
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(domH(`<div>{"foo"}</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div>foo</div>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child expression', () => {
  expect(domH(`<div>{a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_insert_at_marker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div><!$></div>");
    function $$_render_1({ $1 }) {
        let [$_r, $_w] = $$_create_walker($_t_1), $_m_1 = $_w.nextNode();
        $$_insert_at_marker($_m_1, $1);
        return $_r;
    }
    $$_render_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    domH(`<div>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_insert_at_marker, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div><!$><!$></div>"), $_t_2 = $$_create_template("<!$><div></div>"), $_t_3 = $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let [$_r, $_w] = $$_create_walker($_t_2);
        $$_listen($_r, "click", $1);
        return $_r;
    }
    function $$_render_2({ $3 }) {
        let [$_r, $_w] = $$_create_walker($_t_3);
        $$_listen($_r, "click", $3);
        return $_r;
    }
    function $$_render_3({ $2, $4 }) {
        let [$_r, $_w] = $$_create_walker($_t_1), $_m_1 = $_w.nextNode(), $_m_2 = $_w.nextNode();
        $$_insert_at_marker($_m_1, $2());
        $$_insert_at_marker($_m_2, $4());
        return $_r;
    }
    $$_render_3({ $2: () => a() ? $$_render_1({ $1: onA }) : null, $4: () => b() ? $$_render_2({ $3: onB }) : null });
    $$_delegate_events(["click"]);
    "
  `);
});
