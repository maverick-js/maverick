import { ssr } from '../../transform';

test('static', () => {
  expect(ssr(`<svg var:foo={1}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
                "--foo": 1
            })
        })]);
    "
  `);
});

test('multiple static', () => {
  expect(ssr(`<svg var:foo={1} var:bar={2}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
                "--foo": 1,
                "--bar": 2
            })
        })]);
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<svg var:foo={getFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
                "--foo": getFoo()
            })
        })]);
    "
  `);
});

test('multiple dynamic', () => {
  expect(ssr(`<svg var:foo={getFoo()} var:bar={getBar()}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
                "--foo": getFoo(),
                "--bar": getBar()
            })
        })]);
    "
  `);
});

test('signal', () => {
  expect(ssr(`<svg $var:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
                "--foo": foo
            })
        })]);
    "
  `);
});

test('multiple signals', () => {
  expect(ssr(`<svg $var:foo={foo} $var:bar={bar}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><svg", "></svg>"];
    $$_ssr($$_template_1, [$$_attrs({
            style: $$_style("", {
                "--foo": foo,
                "--bar": bar
            })
        })]);
    "
  `);
});
