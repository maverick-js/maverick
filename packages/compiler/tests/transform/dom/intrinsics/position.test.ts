import { t } from '../../transform';

test('children', () => {
  expect(t(`<div><span on:click /><span on:click /><span on:click /></div>`))
    .toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_listen, $$_child, $$_delegate_events } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><span></span><span></span><span></span></div>");
    function $$_render_1({ $1, $2, $3 }) {
        let $_r_1 = $$_clone($_t_1), $_e_1 = $_r_1.firstChild, $_e_2 = $$_child($_r_1, 1), $_e_3 = $$_child($_r_1, 2);
        $$_listen($_e_1, "click", $1);
        $$_listen($_e_2, "click", $2);
        $$_listen($_e_3, "click", $3);
        return $_r_1;
    }
    $$_render_1({ $1: true, $2: true, $3: true });
    $$_delegate_events(["click"]);
    "
  `);
});

test('grandchildren', () => {
  expect(t(`<div><div><span on:click /><span on:click /><span on:click /></div></div>`))
    .toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_listen, $$_child, $$_delegate_events } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><div><span></span><span></span><span></span></div></div>");
    function $$_render_1({ $1, $2, $3 }) {
        let $_r_1 = $$_clone($_t_1), $_e_1 = $_r_1.firstChild, $_e_2 = $_e_1.firstChild, $_e_3 = $$_child($_e_1, 1), $_e_4 = $$_child($_e_1, 2);
        $$_listen($_e_2, "click", $1);
        $$_listen($_e_3, "click", $2);
        $$_listen($_e_4, "click", $3);
        return $_r_1;
    }
    $$_render_1({ $1: true, $2: true, $3: true });
    $$_delegate_events(["click"]);
    "
  `);
});

test('insert before', () => {
  expect(t(`<div>{a()}<div /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_insert } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div><div></div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1), $_e_1 = $_r_1.firstChild;
        $$_insert($_r_1, $1, $_e_1);
        return $_r_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});
