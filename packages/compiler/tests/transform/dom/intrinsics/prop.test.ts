import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<svg prop:width={1920}/>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $_r_1.width = 1920;
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<svg prop:width={1920} prop:height={1080} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $_r_1.width = 1920;
        $_r_1.height = 1080;
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<svg prop:width={calcWidth} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $_r_1.width = $1;
        return $_r_1;
    }
    $$_render_1({ $1: calcWidth });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<svg prop:width={calcWidth} prop:height={calcHeight} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $_r_1.width = $1;
        $_r_1.height = $2;
        return $_r_1;
    }
    $$_render_1({ $1: calcWidth, $2: calcHeight });
    "
  `);
});

test('signal', () => {
  expect(dom(`<svg $prop:width={calcWidth} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_prop, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_prop($_r_1, "width", $1);
        return $_r_1;
    }
    $$_render_1({ $1: calcWidth });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<svg $prop:width={calcWidth} $prop:height={calcHeight} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_prop, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_prop($_r_1, "width", $1);
        $$_prop($_r_1, "height", $2);
        return $_r_1;
    }
    $$_render_1({ $1: calcWidth, $2: calcHeight });
    "
  `);
});
