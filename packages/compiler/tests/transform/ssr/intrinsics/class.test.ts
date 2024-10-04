import { ssr } from '../../transform';

test('static', () => {
  expect(ssr(`<svg class:foo={true} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            class: $$_class("", {
                "foo": true
            })
        })]);
    "
  `);
});

test('multiple static', () => {
  expect(ssr(`<svg class:foo={true} class:bar={false} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            class: $$_class("", {
                "foo": true,
                "bar": false
            })
        })]);
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<svg class:foo={isFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            class: $$_class("", {
                "foo": isFoo()
            })
        })]);
    "
  `);
});

test('multiple dynamic', () => {
  expect(ssr(`<svg class:foo={isFoo()} class:bar={isBar()} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            class: $$_class("", {
                "foo": isFoo(),
                "bar": isBar()
            })
        })]);
    "
  `);
});

test('signal', () => {
  expect(ssr(`<svg $class:foo={isFoo} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            class: $$_class("", {
                "foo": isFoo
            })
        })]);
    "
  `);
});

test('multiple signals', () => {
  expect(ssr(`<svg $class:foo={isFoo} $class:bar={isBar} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            class: $$_class("", {
                "foo": isFoo,
                "bar": isBar
            })
        })]);
    "
  `);
});
