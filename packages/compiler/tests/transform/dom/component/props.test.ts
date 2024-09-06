import { dom } from '../../transform';

test('single prop', () => {
  expect(dom(`<Foo foo={10} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, {
            "foo": 10
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple props', () => {
  expect(dom(`<Foo foo={10} bar={getBar} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, {
            "foo": 10,
            "bar": $1
        });
        return $_c_1;
    }
    $$_render_1({ $1: getBar });
    "
  `);
});
