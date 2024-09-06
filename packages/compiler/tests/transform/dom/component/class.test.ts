import { dom } from '../../transform';

test('append', () => {
  expect(dom(`<Foo class="foo" />`)).toMatchInlineSnapshot(`
    "import { $$_append_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_append_class(host, "foo");
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('static', () => {
  expect(dom(`<Foo class:foo />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_class(host, "foo", true);
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<Foo class:foo={true} class:bar={false} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_class(host, "foo", true);
            $$_class(host, "bar", false);
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<Foo class:foo={isFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_class(host, "foo", $1);
        });
        return $_c_1;
    }
    $$_render_1({ $1: isFoo() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<Foo class:foo={isFoo()} class:bar={isBar()} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_class(host, "foo", $1);
            $$_class(host, "bar", $2);
        });
        return $_c_1;
    }
    $$_render_1({ $1: isFoo(), $2: isBar() });
    "
  `);
});

test('signal', () => {
  expect(dom(`<Foo $class:foo={isFoo} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_class(host, "foo", $1);
        });
        return $_c_1;
    }
    $$_render_1({ $1: isFoo });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<Foo $class:foo={isFoo} $class:bar={isBar} />`)).toMatchInlineSnapshot(`
    "import { $$_class, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_class(host, "foo", $1);
            $$_class(host, "bar", $2);
        });
        return $_c_1;
    }
    $$_render_1({ $1: isFoo, $2: isBar });
    "
  `);
});
