import { dom } from '../../transform';

test('on', () => {
  expect(dom('<Foo on:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_listen } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_listen($_c_1, "click", $1);
        return $_c_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('capture', () => {
  expect(dom('<Foo on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_listen } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_listen($_c_1, "click", $1, true);
        return $_c_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('multiple', () => {
  expect(dom('<Foo on:pointerdown={onDown} on:pointerup={onUp}  />')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_listen } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_listen($_c_1, "pointerdown", $1);
        $$_listen($_c_1, "pointerup", $2);
        return $_c_1;
    }
    $$_render_1({ $1: onDown, $2: onUp });
    "
  `);
});

test('forward', () => {
  expect(dom('<Foo on:click />')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_forward_event } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo);
        $$_forward_event($_c_1, "click");
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});
