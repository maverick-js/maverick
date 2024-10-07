import { react } from '../../transform';

test('spread', () => {
  expect(react('<Foo {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_listen_callback, $$_host_spread } from "@maverick-js/dom";
    let $_prop_1 = a, $_listeners_1 = $$_listen_callback($_prop_1), $_component_1 = $$_component(Foo, $_prop_1, $$_IS_CLIENT && $_listeners_1, null, host => {
        $$_host_spread(host, $_prop_1);
    });
    $_component_1
    "
  `);
});

test('multiple', () => {
  expect(react('<Foo {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_merge_props, $$_listen_callback, $$_host_spread } from "@maverick-js/dom";
    let $_prop_1 = $$_merge_props(a, b, { a: 1, b: 2 }), $_listeners_1 = $$_listen_callback($_prop_1), $_component_1 = $$_component(Foo, $_prop_1, $$_IS_CLIENT && $_listeners_1, null, host => {
        $$_host_spread(host, $_prop_1);
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
    import { $$_merge_props, $$_listen_callback, $$_host_spread } from "@maverick-js/dom";
    let $_prop_1 = $$_merge_props(a, b), $_listeners_1 = $$_listen_callback($_prop_1), $_component_1 = $$_component(Foo, $_prop_1, $$_IS_CLIENT && $_listeners_1, null, host => {
        $$_host_spread(host, $_prop_1);
    });
    $_component_1
    "
  `);
});

test('with props', () => {
  expect(react('<Foo {...a} {...b} foo={10} bar={20}  />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_merge_props, $$_listen_callback, $$_host_spread } from "@maverick-js/dom";
    let $_prop_1 = $$_merge_props(a, b, {
        "foo": 10,
        "bar": 20
    }), $_listeners_1 = $$_listen_callback($_prop_1), $_component_1 = $$_component(Foo, $_prop_1, $$_IS_CLIENT && $_listeners_1, null, host => {
        $$_host_spread(host, $_prop_1);
    });
    $_component_1
    "
  `);
});

test('inside expression', () => {
  expect(react('<div>{a() ? <Foo {...a} {...b} /> : null}</div>')).toMatchInlineSnapshot(`
    "import { $$_memo, $$_IS_CLIENT, $$_component, $$_h, $$_computed, $$_expression } from "@maverick-js/react";
    import { $$_merge_props, $$_listen_callback, $$_host_spread } from "@maverick-js/dom";
    let $_node_1 = $$_h($_render_1), $_computed_1 = $$_computed(() => a() ? $_node_1 : null), $_node_2 = $$_h($_render_2);
    function $_render_1() {
        let $_prop_1 = $$_memo(() => $$_merge_props(a, b)), $_listeners_1 = $$_memo(() => $$_listen_callback($_prop_1)), $_component_1 = $$_memo(() => $$_component(Foo, $_prop_1, $$_IS_CLIENT && $_listeners_1, null, host => {
            $$_host_spread(host, $_prop_1);
        }));
        return $_component_1;
    }
    function $_render_2() {
        let $_expression_1 = $$_expression($_computed_1);
        return $$_h("div", null, $_expression_1);
    }
    $_node_2
    "
  `);
});
