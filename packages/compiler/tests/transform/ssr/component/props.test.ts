import { ssr } from '../../transform';

test('single prop', () => {
  expect(ssr(`<Foo foo={10} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, {
        "foo": 10
    });
    "
  `);
});

test('multiple props', () => {
  expect(ssr(`<Foo foo={10} bar={getBar} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, {
        "foo": 10,
        "bar": getBar
    });
    "
  `);
});
