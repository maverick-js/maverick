import { react } from '../../transform';

test('spread', () => {
  expect(
    react(`
function Foo() {
  return <div {...a}  />
}
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_spread } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_spread(el, a);
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ref: $_ref_1
            });
        }
        return $_node_1;
    }
    "
  `);
});

test('multiple', () => {
  expect(
    react(`
function Foo() {
  return <div {...a} {...b} {...{a: 1, b: 2}} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_merge_props, $$_spread } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_spread(el, $$_merge_props(a, b, { a: 1, b: 2 }));
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ref: $_ref_1
            });
        }
        return $_node_1;
    }
    "
  `);
});

test('with attributes', () => {
  expect(
    react(`
function Foo() {
  return <div {...a} {...b} $prop:foo={fooProp} $class:foo={isFoo} $style:color={color} $var:foo={fooVar} on:click={onClick} ref={onRef} />
}
`),
  ).toMatchInlineSnapshot(`
    "import { $$_attach, $$_h } from "@maverick-js/react";
    import { $$_merge_props, $$_spread } from "@maverick-js/dom";
    function Foo() {
        let $_node_1 = $$_h($_render_1);
        function $_attach_1(el) {
            $$_spread(el, $$_merge_props(a, b, {
                "$class:foo": isFoo,
                "$style:color": color,
                "$var:foo": fooVar,
                "$prop:foo": fooProp,
                "on:click": onClick,
                ref: onRef
            }));
        }
        function $_render_1() {
            let $_ref_1 = $$_attach($_attach_1);
            return $$_h("div", {
                ref: $_ref_1
            });
        }
        return $_node_1;
    }
    "
  `);
});
