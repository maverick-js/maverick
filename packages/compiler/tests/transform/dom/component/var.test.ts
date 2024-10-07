import { dom } from '../../transform';

test('static', () => {
  expect(dom(`<Foo var:foo={1}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, null, host => {
            $$_style(host, "--foo", 1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('multiple static', () => {
  expect(dom(`<Foo var:foo={1} var:bar={2}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, null, host => {
            $$_style(host, "--foo", 1);
            $$_style(host, "--bar", 2);
        });
        return $_component_1;
    }
    $$_render_1({ $1: Foo });
    "
  `);
});

test('dynamic', () => {
  expect(dom(`<Foo var:foo={getFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, null, null, null, host => {
            $$_style(host, "--foo", $1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: getFoo(), $2: Foo });
    "
  `);
});

test('multiple dynamic', () => {
  expect(dom(`<Foo var:foo={getFoo()} var:bar={getBar()}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3 }) {
        let $_component_1 = $$_create_component($3, null, null, null, host => {
            $$_style(host, "--foo", $1);
            $$_style(host, "--bar", $2);
        });
        return $_component_1;
    }
    $$_render_1({ $1: getFoo(), $2: getBar(), $3: Foo });
    "
  `);
});

test('signal', () => {
  expect(dom(`<Foo $var:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, null, null, null, host => {
            $$_style(host, "--foo", $1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: foo, $2: Foo });
    "
  `);
});

test('multiple signals', () => {
  expect(dom(`<Foo $var:foo={foo} $var:bar={bar}/>`)).toMatchInlineSnapshot(`
    "import { $$_style, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2, $3 }) {
        let $_component_1 = $$_create_component($3, null, null, null, host => {
            $$_style(host, "--foo", $1);
            $$_style(host, "--bar", $2);
        });
        return $_component_1;
    }
    $$_render_1({ $1: foo, $2: bar, $3: Foo });
    "
  `);
});
