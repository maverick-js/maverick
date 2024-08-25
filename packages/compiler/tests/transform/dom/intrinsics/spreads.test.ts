import { t } from '../../transform';

test('spread', () => {
  expect(t('<div {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_spread } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_spread($_r_1, $1);
        return $_r_1;
    }
    $$_render_1({ $1: a });
    "
  `);
});

test('multiple', () => {
  expect(t('<div {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_merge_props, $$_spread } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1, $2, $3 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_spread($_r_1, $$_merge_props($1, $2, $3));
        return $_r_1;
    }
    $$_render_1({ $1: a, $2: b, $3: { a: 1, b: 2 } });
    "
  `);
});

test('with attributes', () => {
  expect(
    t(
      '<div {...a} {...b} $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_merge_props, $$_spread } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1, $2, $3, $4, $5, $6 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_spread($_r_1, $$_merge_props($1, $2, { "$class:foo": $3, "$style:color": $4, "$var:foo": $5, "on:click": $6 }));
        return $_r_1;
    }
    $$_render_1({ $1: a, $2: b, $3: isFoo, $4: color, $5: fooVar, $6: onClick });
    "
  `);
});
