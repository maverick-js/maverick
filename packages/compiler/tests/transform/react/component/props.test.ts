import { react } from '../../transform';

test('single prop', () => {
  expect(react(`<Foo foo={10} />`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, {
        "foo": 10
    });
    $_component_1
    "
  `);
});

test('multiple props', () => {
  expect(react(`<Foo foo={10} bar={getBar} />`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    let $_component_1 = $$_component(Foo, {
        "foo": 10,
        "bar": getBar
    });
    $_component_1
    "
  `);
});
