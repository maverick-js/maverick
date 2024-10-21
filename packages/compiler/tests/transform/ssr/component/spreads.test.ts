import { ssr } from '../../transform';

test('spread', () => {
  expect(ssr('<Foo {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_merge_host_attrs, $$_create_component } from "@maverick-js/ssr";
    let $_spread_1 = a;
    $$_create_component(Foo, $_spread_1, null, $$_merge_host_attrs($_spread_1));
    "
  `);
});

test('multiple', () => {
  expect(ssr('<Foo {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_merge_host_attrs, $$_create_component } from "@maverick-js/ssr";
    let $_spread_1 = $$_merge_props(a, b, { a: 1, b: 2 });
    $$_create_component(Foo, $_spread_1, null, $$_merge_host_attrs($_spread_1));
    "
  `);
});

test('with attributes', () => {
  expect(
    ssr(
      '<Foo {...a} {...b} class="..." $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_merge_host_attrs, $$_create_component } from "@maverick-js/ssr";
    let $_spread_1 = $$_merge_props(a, b);
    $$_create_component(Foo, $_spread_1, null, $$_merge_host_attrs($_spread_1, {
        class: "...",
        "$class:foo": isFoo,
        "$var:foo": fooVar
    }));
    "
  `);
});

test('with props', () => {
  expect(ssr('<Foo {...a} {...b} foo={10} bar={20}  />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_merge_host_attrs, $$_create_component } from "@maverick-js/ssr";
    let $_spread_1 = $$_merge_props(a, b);
    $$_create_component(Foo, $$_merge_props($_spread_1, {
        "foo": 10,
        "bar": 20
    }), null, $$_merge_host_attrs($_spread_1));
    "
  `);
});
