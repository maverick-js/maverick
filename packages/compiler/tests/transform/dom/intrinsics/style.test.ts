import { t } from '../../transform';

test('static', () => {
  expect(t(`<svg style:color="blue"/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "color", "blue");
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(t(`<svg style:color="blue" style:backgroundColor="red"/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "color", "blue");
        $$_style($_r_1, "backgroundColor", "red");
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(t(`<svg style:color={getColor()} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "color", $1);
        return $_r_1;
    }
    $$_render_1({ $1: getColor() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(t(`<svg style:color={getColor()} style:backgroundColor={getBgColor()}/>`))
    .toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "color", $1);
        $$_style($_r_1, "backgroundColor", $2);
        return $_r_1;
    }
    $$_render_1({ $1: getColor(), $2: getBgColor() });
    "
  `);
});

test('signal', () => {
  expect(t(`<svg $style:color={color} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "color", $1);
        return $_r_1;
    }
    $$_render_1({ $1: color });
    "
  `);
});

test('multiple signals', () => {
  expect(t(`<svg $style:color={color} $style:backgroundColor={bgColor}/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "color", $1);
        $$_style($_r_1, "backgroundColor", $2);
        return $_r_1;
    }
    $$_render_1({ $1: color, $2: bgColor });
    "
  `);
});
