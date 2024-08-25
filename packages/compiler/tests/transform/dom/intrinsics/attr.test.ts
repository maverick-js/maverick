import { t } from '../../transform';

test('none', () => {
  expect(t(`<svg />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    $$_clone($_t_1);
    "
  `);
});

test('static', () => {
  expect(t(`<svg width={1920} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg width=\\"1920\\"></svg>");
    $$_clone($_t_1);
    "
  `);
});

test('multiple static', () => {
  expect(t(`<svg width={1920} height={1080} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg width=\\"1920\\" height=\\"1080\\"></svg>");
    $$_clone($_t_1);
    "
  `);
});

test('dynamic', () => {
  expect(t(`<svg width={calcWidth} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_attr } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_attr($_r_1, "width", $1);
        return $_r_1;
    }
    $$_render_1({ $1: calcWidth });
    "
  `);
});

test('multiple dynamic', () => {
  expect(t(`<svg width={calcWidth} height={calcHeight} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_attr } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_attr($_r_1, "width", $1);
        $$_attr($_r_1, "height", $2);
        return $_r_1;
    }
    $$_render_1({ $1: calcWidth, $2: calcHeight });
    "
  `);
});

test('signal', () => {
  expect(t(`<svg $width={width} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_attr } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_attr($_r_1, "width", $1);
        return $_r_1;
    }
    $$_render_1({ $1: width });
    "
  `);
});

test('multiple signals', () => {
  expect(t(`<svg $width={width} $height={height} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_attr } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_attr($_r_1, "width", $1);
        $$_attr($_r_1, "height", $2);
        return $_r_1;
    }
    $$_render_1({ $1: width, $2: height });
    "
  `);
});
