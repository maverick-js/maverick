import { t } from '../../transform';

test('on', () => {
  expect(t('<div on:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_listen, $$_delegate_events } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $1);
        return $_r_1;
    }
    $$_render_1({ $1: onClick });
    $$_delegate_events(["click"]);
    "
  `);
});

test('capture', () => {
  expect(t('<div on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_listen } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $1, true);
        return $_r_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('multiple', () => {
  expect(t('<div on:pointerdown={onDown} on:pointerup={onUp}  />')).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_listen, $$_delegate_events } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "pointerdown", $1);
        $$_listen($_r_1, "pointerup", $2);
        return $_r_1;
    }
    $$_render_1({ $1: onDown, $2: onUp });
    $$_delegate_events(["pointerdown", "pointerup"]);
    "
  `);
});
