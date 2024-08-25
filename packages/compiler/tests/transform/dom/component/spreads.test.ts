import { t } from '../../transform';

test('spread', () => {
  expect(t('<Foo {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_component_spread } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_component_spread($_c_1, $1);
        return $_c_1;
    }
    $$_render_1({ $1: a });
    "
  `);
});

test('multiple', () => {
  expect(t('<Foo {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props, $$_component_spread } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_component_spread($_c_1, $$_merge_props($1, $2, $3));
        return $_c_1;
    }
    $$_render_1({ $1: a, $2: b, $3: { a: 1, b: 2 } });
    "
  `);
});

test('with attributes', () => {
  expect(
    t(
      '<Foo {...a} {...b} $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props, $$_component_spread } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3, $4, $5 }) {
        let $_c_1 = $$_create_component(Foo);
        $$_component_spread($_c_1, $$_merge_props($1, $2, { "$class:foo": $3, "$var:foo": $4, "on:click": $5 }));
        return $_c_1;
    }
    $$_render_1({ $1: a, $2: b, $3: isFoo, $4: fooVar, $5: onClick });
    "
  `);
});
