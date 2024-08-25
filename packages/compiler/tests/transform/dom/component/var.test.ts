import { t } from '../../transform';

test('static', () => {
  expect(t(`<Foo var:foo={1}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_style(host, "--foo", 1);
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(t(`<Foo var:foo={1} var:bar={2}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1() {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_style(host, "--foo", 1);
            $$_style(host, "--bar", 2);
        });
        return $_c_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(t(`<Foo var:foo={getFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_style(host, "--foo", $1);
        });
        return $_c_1;
    }
    $$_render_1({ $1: getFoo() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(t(`<Foo var:foo={getFoo()} var:bar={getBar()}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_style(host, "--foo", $1);
            $$_style(host, "--bar", $2);
        });
        return $_c_1;
    }
    $$_render_1({ $1: getFoo(), $2: getBar() });
    "
  `);
});

test('signal', () => {
  expect(t(`<Foo $var:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_style(host, "--foo", $1);
        });
        return $_c_1;
    }
    $$_render_1({ $1: foo });
    "
  `);
});

test('multiple signals', () => {
  expect(t(`<Foo $var:foo={foo} $var:bar={bar}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_c_1 = $$_create_component(Foo, null, null, host => {
            $$_style(host, "--foo", $1);
            $$_style(host, "--bar", $2);
        });
        return $_c_1;
    }
    $$_render_1({ $1: foo, $2: bar });
    "
  `);
});
