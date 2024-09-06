// fragment component
import { dom } from '../../transform';

test('no children', () => {
  expect(dom(`<div></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    $$_clone($_t_1);
    "
  `);
});

test('text child', () => {
  expect(dom(`<div>Foo</div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div>Foo</div>");
    $$_clone($_t_1);
    "
  `);
});

test('one static child element', () => {
  expect(dom(`<div><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><span></span></div>");
    $$_clone($_t_1);
    "
  `);
});

test('multiple static child elements', () => {
  expect(dom(`<div><span></span><span></span></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><span></span><span></span></div>");
    $$_clone($_t_1);
    "
  `);
});

test('one dynamic child element', () => {
  expect(dom(`<div><span on:click={onClick} /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><span></span></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1), $_e_1 = $_r_1.firstChild;
        $$_listen($_e_1, "click", $1);
        return $_r_1;
    }
    $$_render_1({ $1: onClick });
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(dom(`<div><span on:click={onA} /><span on:click={onB} /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_child, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><span></span><span></span></div>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1), $_e_1 = $_r_1.firstChild, $_e_2 = $$_child($_r_1, 1);
        $$_listen($_e_1, "click", $1);
        $$_listen($_e_2, "click", $2);
        return $_r_1;
    }
    $$_render_1({ $1: onA, $2: onB });
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(dom(`<div>{"foo"}</div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div>foo</div>");
    $$_clone($_t_1);
    "
  `);
});

test('one dynamic child expression', () => {
  expect(dom(`<div>{a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_insert($_r_1, $1);
        return $_r_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    dom(`<div>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_insert, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>"), $_t_2 = $_t_1, $_t_3 = $$_create_template("<span></span>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_2);
        $$_listen($_r_1, "click", $1);
        return $_r_1;
    }
    function $$_render_2({ $3 }) {
        let $_r_2 = $$_clone($_t_3);
        $$_listen($_r_2, "click", $3);
        return $_r_2;
    }
    function $$_render_3({ $2, $4 }) {
        let $_r_3 = $$_clone($_t_1);
        $$_insert($_r_3, $2);
        $$_insert($_r_3, $4);
        return $_r_3;
    }
    $$_render_3({ $2: a() ? $$_render_1({ $1: onA }) : null, $4: b() ? $$_render_2({ $3: onB }) : null });
    $$_delegate_events(["click"]);
    "
  `);
});
