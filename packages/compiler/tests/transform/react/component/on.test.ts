import { react } from '../../transform';

test('on', () => {
  expect(react('<Foo on:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_listen } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, $$_IS_CLIENT && (instance => {
        $$_listen(instance, "click", onClick);
    }));
    $_component_1
    "
  `);
});

test('capture', () => {
  expect(react('<Foo on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_listen } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, $$_IS_CLIENT && (instance => {
        $$_listen(instance, "click", onClick, true);
    }));
    $_component_1
    "
  `);
});

test('multiple', () => {
  expect(react('<Foo on:pointerdown={onDown} on:pointerup={onUp}  />')).toMatchInlineSnapshot(`
    "import { $$_IS_CLIENT, $$_component } from "@maverick-js/react";
    import { $$_listen } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, $$_IS_CLIENT && (instance => {
        $$_listen(instance, "pointerdown", onDown);
        $$_listen(instance, "pointerup", onUp);
    }));
    $_component_1
    "
  `);
});
