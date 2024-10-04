import { ssr } from '../../transform';

test('spread', () => {
  expect(ssr('<div {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><div", "></div>"];
    $$_ssr($$_template_1, [$$_attrs(a)]);
    "
  `);
});

test('multiple', () => {
  expect(ssr('<div {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><div", "></div>"];
    $$_ssr($$_template_1, [$$_attrs($$_merge_props(a, b, { a: 1, b: 2 }))]);
    "
  `);
});

test('with attributes', () => {
  expect(
    ssr(
      '<div {...a} {...b} $prop:foo={fooProp} $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} ref={onRef} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_attrs, $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><div", "></div>"];
    $$_ssr($$_template_1, [$$_attrs($$_merge_props(a, b, {
            "$class:foo": isFoo,
            "$style:color": color,
            "$var:foo": fooVar
        }))]);
    "
  `);
});
