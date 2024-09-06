import { dom } from '../../transform';

test('spread', () => {
  expect(dom('<div {...a}  />')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_spread, $$_create_template } from "@maverick-js/dom";
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
  expect(dom('<div {...a} {...b} {...{a: 1, b: 2}} />')).toMatchInlineSnapshot(`
    "import { $$_clone, $$_merge_props, $$_spread, $$_create_template } from "@maverick-js/dom";
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
    dom(
      '<div {...a} {...b} $prop:foo={fooProp} $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} ref={onRef} />',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_clone, $$_merge_props, $$_spread, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1, $2, $3, $4, $5, $6, $7, $8 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_spread($_r_1, $$_merge_props($1, $2, {
            "$class:foo": $4,
            "$style:color": $5,
            "$var:foo": $6,
            "$prop:foo": $3,
            "on:click": $7,
            ref: $8
        }));
        return $_r_1;
    }
    $$_render_1({ $1: a, $2: b, $3: fooProp, $4: isFoo, $5: color, $6: fooVar, $7: onClick, $8: onRef });
    "
  `);
});
