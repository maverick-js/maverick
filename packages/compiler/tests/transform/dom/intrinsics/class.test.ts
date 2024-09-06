import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<svg class:foo={true} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $$_class($_r_1, "foo", true);
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<svg class:foo={true} class:bar={false} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $$_class($_r_1, "foo", true);
        $$_class($_r_1, "bar", false);
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<svg class:foo={isFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_class($_r_1, "foo", $1);
        return $_r_1;
    }
    $$_render_1({ $1: isFoo() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<svg class:foo={isFoo()} class:bar={isBar()} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_class($_r_1, "foo", $1);
        $$_class($_r_1, "bar", $2);
        return $_r_1;
    }
    $$_render_1({ $1: isFoo(), $2: isBar() });
    "
  `);
});

test('signal', () => {
  expect(dom(`<svg $class:foo={isFoo} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_class($_r_1, "foo", $1);
        return $_r_1;
    }
    $$_render_1({ $1: isFoo });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<svg $class:foo={isFoo} $class:bar={isBar} />`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_class($_r_1, "foo", $1);
        $$_class($_r_1, "bar", $2);
        return $_r_1;
    }
    $$_render_1({ $1: isFoo, $2: isBar });
    "
  `);
});
