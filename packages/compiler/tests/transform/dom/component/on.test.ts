import { dom } from '../../transform';

test('on', () => {
  expect(dom('<Foo on:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, null, $_target_1 => {
            $$_listen($_target_1, "click", $1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: onClick, $2: Foo });
    "
  `);
});

test('capture', () => {
  expect(dom('<Foo on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, null, $_target_1 => {
            $$_listen($_target_1, "click", $1, true);
        });
        return $_component_1;
    }
    $$_render_1({ $1: onClick, $2: Foo });
    "
  `);
});

test('multiple', () => {
  expect(dom('<Foo on:pointerdown={onDown} on:pointerup={onUp}  />')).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3 }) {
        let $_component_1 = $$_create_component($3, null, $_target_1 => {
            $$_listen($_target_1, "pointerdown", $1);
            $$_listen($_target_1, "pointerup", $2);
        });
        return $_component_1;
    }
    $$_render_1({ $1: onDown, $2: onUp, $3: Foo });
    "
  `);
});

test('forward', () => {
  expect(dom('<Foo on:click />')).toMatchInlineSnapshot(`
    "import { $$_forward_event, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, $_target_1 => {
            $$_forward_event($_target_1, "click");
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});
