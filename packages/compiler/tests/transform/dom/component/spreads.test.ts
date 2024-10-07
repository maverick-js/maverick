import { dom } from '../../transform';

test('spread', () => {
  expect(dom('<Foo {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_listen_callback, $$_host_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $$_merged_props_1 = $1, $_component_1 = $$_create_component($2, $$_merged_props_1, $$_listen_callback($$_merged_props_1), null, host => {
            $$_host_spread(host, $$_merged_props_1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: a, $2: Foo });
    "
  `);
});

test('multiple', () => {
  expect(dom('<Foo {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_listen_callback, $$_host_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3, $4 }) {
        let $$_merged_props_1 = $$_merge_props($1, $2, $3), $_component_1 = $$_create_component($4, $$_merged_props_1, $$_listen_callback($$_merged_props_1), null, host => {
            $$_host_spread(host, $$_merged_props_1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: a, $2: b, $3: { a: 1, b: 2 }, $4: Foo });
    "
  `);
});

test('with attributes', () => {
  expect(
    dom(
      '<Foo {...a} {...b} class="..." $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_listen_callback, $$_host_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3, $4, $5, $6 }) {
        let $$_merged_props_1 = $$_merge_props($1, $2), $_component_1 = $$_create_component($6, $$_merged_props_1, $$_listen_callback($$_merged_props_1, {
            "on:click": $5
        }), null, host => {
            $$_host_spread(host, $$_merged_props_1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: a, $2: b, $3: isFoo, $4: fooVar, $5: onClick, $6: Foo });
    "
  `);
});

test('with props', () => {
  expect(dom('<Foo {...a} {...b} foo={10} bar={20}  />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_listen_callback, $$_host_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3 }) {
        let $$_merged_props_1 = $$_merge_props($1, $2, {
            "foo": 10,
            "bar": 20
        }), $_component_1 = $$_create_component($3, $$_merged_props_1, $$_listen_callback($$_merged_props_1), null, host => {
            $$_host_spread(host, $$_merged_props_1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: a, $2: b, $3: Foo });
    "
  `);
});
