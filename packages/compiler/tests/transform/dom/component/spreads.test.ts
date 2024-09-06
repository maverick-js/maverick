import { dom } from '../../transform';

test('spread', () => {
  expect(dom('<Foo {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, $1, null, host => {
            $$_spread(host, $1);
        });
        return $_c_1;
    }
    $$_render_1({ $1: a });
    "
  `);
});

test('multiple', () => {
  expect(dom('<Foo {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3 }) {
        let $_c_1 = $$_create_component(Foo, $$_merge_props($1, $2, $3), null, host => {
            $$_spread(host, $$_merge_props($1, $2, $3));
        });
        return $_c_1;
    }
    $$_render_1({ $1: a, $2: b, $3: { a: 1, b: 2 } });
    "
  `);
});

test('with attributes', () => {
  expect(
    dom(
      '<Foo {...a} {...b} class="..." $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3, $4, $5 }) {
        let $_c_1 = $$_create_component(Foo, $$_merge_props($1, $2), null, host => {
            $$_spread(host, $$_merge_props($1, $2, {
                class: "...",
                "$class:foo": $3,
                "$var:foo": $4,
                "on:click": $5
            }));
        });
        return $_c_1;
    }
    $$_render_1({ $1: a, $2: b, $3: isFoo, $4: fooVar, $5: onClick });
    "
  `);
});

test('with props', () => {
  expect(dom('<Foo {...a} {...b} foo={10} bar={20}  />')).toMatchInlineSnapshot(`
    "import { $$_merge_props, $$_spread, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo, $$_merge_props($1, $2, {
            "foo": 10,
            "bar": 20
        }), null, host => {
            $$_spread(host, $$_merge_props($1, $2));
        });
        return $_c_1;
    }
    $$_render_1({ $1: a, $2: b });
    "
  `);
});
