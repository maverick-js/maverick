import { dom } from '../../transform';

test('single prop', () => {
  expect(dom(`<Foo foo={10} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, {
            "foo": 10
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('multiple props', () => {
  expect(dom(`<Foo foo={10} bar={getBar} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, {
            "foo": 10,
            "bar": $1
        });
        return $_component_1;
    }
    $$_render_1({ $1: getBar, $2: Foo });
    "
  `);
});
