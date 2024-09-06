import { ssr } from '../../transform';

test('on', () => {
  expect(ssr('<Foo on:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo);
    "
  `);
});

test('capture', () => {
  expect(ssr('<Foo on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo);
    "
  `);
});
