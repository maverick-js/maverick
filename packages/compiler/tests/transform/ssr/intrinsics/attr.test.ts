import { ssr } from '../../transform';

test('none', () => {
  expect(ssr(`<svg />`)).toMatchInlineSnapshot(`
    ""<svg></svg>";
    "
  `);
});

test('static', () => {
  expect(ssr(`<svg width={1920} />`)).toMatchInlineSnapshot(`
    ""<svg width=\\"1920\\"></svg>";
    "
  `);
});

test('multiple static', () => {
  expect(ssr(`<svg width={1920} height={1080} />`)).toMatchInlineSnapshot(`
    ""<svg width=\\"1920\\" height=\\"1080\\"></svg>";
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<svg width={calcWidth} />`)).toMatchInlineSnapshot(`
    "import { $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_t_1, [$$_attrs({
            "width": calcWidth
        })]);
    "
  `);
});

test('multiple dynamic', () => {
  expect(ssr(`<svg width={calcWidth} height={calcHeight} />`)).toMatchInlineSnapshot(`
    "import { $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_t_1, [$$_attrs({
            "width": calcWidth,
            "height": calcHeight
        })]);
    "
  `);
});

test('signal', () => {
  expect(ssr(`<svg $width={width} />`)).toMatchInlineSnapshot(`
    "import { $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_t_1, [$$_attrs({
            "width": width
        })]);
    "
  `);
});

test('multiple signals', () => {
  expect(ssr(`<svg $width={width} $height={height} />`)).toMatchInlineSnapshot(`
    "import { $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_t_1, [$$_attrs({
            "width": width,
            "height": height
        })]);
    "
  `);
});
