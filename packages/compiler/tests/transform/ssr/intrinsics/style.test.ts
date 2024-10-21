import { ssr } from '../../transform';

test('static', () => {
  expect(ssr(`<svg style:color="blue"/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style(null, {
                "color": "blue"
            })
        })]);
    "
  `);
});

test('multiple static', () => {
  expect(ssr(`<svg style:color="blue" style:backgroundColor="red"/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style(null, {
                "color": "blue",
                "background-color": "red"
            })
        })]);
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<svg style:color={getColor()} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style(null, {
                "color": getColor()
            })
        })]);
    "
  `);
});

test('multiple dynamic', () => {
  expect(ssr(`<svg style:color={getColor()} style:backgroundColor={getBgColor()}/>`))
    .toMatchInlineSnapshot(`
      "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
      let $$_template_1 = ["<!$><svg", "></svg>"];
      $$_ssr($$_template_1, [$$_attrs({
              style: $$_style(null, {
                  "color": getColor(),
                  "background-color": getBgColor()
              })
          })]);
      "
    `);
});

test('signal', () => {
  expect(ssr(`<svg $style:color={color} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style(null, {
                "color": color
            })
        })]);
    "
  `);
});

test('multiple signals', () => {
  expect(ssr(`<svg $style:color={color} $style:backgroundColor={bgColor}/>`))
    .toMatchInlineSnapshot(`
      "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
      let $$_template_1 = ["<!$><svg", "></svg>"];
      $$_ssr($$_template_1, [$$_attrs({
              style: $$_style(null, {
                  "color": color,
                  "background-color": bgColor
              })
          })]);
      "
    `);
});
