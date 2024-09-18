import { react } from '../../transform';

test('static', () => {
  expect(react(`<Foo var:foo={1}/>`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, null, null, host => {
        $$_style(host, "--foo", 1);
    });
    $_component_1
    "
  `);
});

test('multiple static', () => {
  expect(react(`<Foo var:foo={1} var:bar={2}/>`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, null, null, host => {
        $$_style(host, "--foo", 1);
        $$_style(host, "--bar", 2);
    });
    $_component_1
    "
  `);
});

test('dynamic', () => {
  expect(react(`<Foo var:foo={getFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, null, null, host => {
        $$_style(host, "--foo", getFoo());
    });
    $_component_1
    "
  `);
});

test('multiple dynamic', () => {
  expect(react(`<Foo var:foo={getFoo()} var:bar={getBar()}/>`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, null, null, host => {
        $$_style(host, "--foo", getFoo());
        $$_style(host, "--bar", getBar());
    });
    $_component_1
    "
  `);
});

test('signal', () => {
  expect(react(`<Foo $var:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, null, null, host => {
        $$_style(host, "--foo", foo);
    });
    $_component_1
    "
  `);
});

test('multiple signals', () => {
  expect(react(`<Foo $var:foo={foo} $var:bar={bar}/>`)).toMatchInlineSnapshot(`
    "import { $$_component } from "@maverick-js/react";
    import { $$_style } from "@maverick-js/dom";
    let $_component_1 = $$_component(Foo, null, null, null, host => {
        $$_style(host, "--foo", foo);
        $$_style(host, "--bar", bar);
    });
    $_component_1
    "
  `);
});
