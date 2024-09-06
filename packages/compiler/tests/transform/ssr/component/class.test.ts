import { ssr } from '../../transform';

test('append', () => {
  expect(ssr(`<Foo class="foo" />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        class: "foo"
    });
    "
  `);
});

test('static', () => {
  expect(ssr(`<Foo class:foo />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        $class: {
            "foo": true
        }
    });
    "
  `);
});

test('multiple static', () => {
  expect(ssr(`<Foo class:foo={true} class:bar={false} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        $class: {
            "foo": true,
            "bar": false
        }
    });
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<Foo class:foo={isFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        $class: {
            "foo": isFoo()
        }
    });
    "
  `);
});

test('multiple dynamic', () => {
  expect(ssr(`<Foo class:foo={isFoo()} class:bar={isBar()} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        $class: {
            "foo": isFoo(),
            "bar": isBar()
        }
    });
    "
  `);
});

test('signal', () => {
  expect(ssr(`<Foo $class:foo={isFoo} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        $class: {
            "foo": isFoo
        }
    });
    "
  `);
});

test('multiple signals', () => {
  expect(ssr(`<Foo $class:foo={isFoo} $class:bar={isBar} />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, null, {
        $class: {
            "foo": isFoo,
            "bar": isBar
        }
    });
    "
  `);
});
