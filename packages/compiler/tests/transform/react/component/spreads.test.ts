import { react } from '../../transform';

test('spread', () => {
  expect(react('<Foo {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_listen_callback, $$_spread } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, a, $$_IS_CLIENT && $$_listen_callback(a), null, host => {
        $$_spread(host, a);
    });
    $_component_1
    "
  `);
});

test('multiple', () => {
  expect(react('<Foo {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_merge_props, $$_listen_callback, $$_spread } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, $$_merge_props(a, b, { a: 1, b: 2 }), $$_IS_CLIENT && $$_listen_callback(a, b, { a: 1, b: 2 }), null, host => {
        $$_spread(host, $$_merge_props(a, b, { a: 1, b: 2 }));
    });
    $_component_1
    "
  `);
});

test('with attributes', () => {
  expect(
    react(
      '<Foo {...a} {...b} class="..." $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_merge_props, $$_listen_callback, $$_spread } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, $$_merge_props(a, b), $$_IS_CLIENT && $$_listen_callback(a, b, {
        "on:click": onClick
    }), null, host => {
        $$_spread(host, $$_merge_props(a, b, {
            class: "...",
            "$class:foo": isFoo,
            "$var:foo": fooVar,
            "on:click": onClick
        }));
    });
    $_component_1
    "
  `);
});

test('with props', () => {
  expect(react('<Foo {...a} {...b} foo={10} bar={20}  />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_merge_props, $$_listen_callback, $$_spread } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, $$_merge_props(a, b, {
        "foo": 10,
        "bar": 20
    }), $$_IS_CLIENT && $$_listen_callback(a, b), null, host => {
        $$_spread(host, $$_merge_props(a, b));
    });
    $_component_1
    "
  `);
});
