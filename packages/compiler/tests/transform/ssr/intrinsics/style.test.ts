import { ssr } from '../../transform';

test('static', () => {
  expect(ssr(`<svg style:color="blue"/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
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
            style: $$_style("", {
                "color": "blue",
                "backgroundColor": "red"
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
            style: $$_style("", {
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
              style: $$_style("", {
                  "color": getColor(),
                  "backgroundColor": getBgColor()
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
            style: $$_style("", {
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
              style: $$_style("", {
                  "color": color,
                  "backgroundColor": bgColor
              })
          })]);
      "
    `);
});
