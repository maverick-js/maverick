import { t } from '../../transform';

test('static', () => {
  expect(t(`<svg var:foo={1}/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "--foo", 1);
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static', () => {
  expect(t(`<svg var:foo={1} var:bar={2}/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1() {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "--foo", 1);
        $$_style($_r_1, "--bar", 2);
        return $_r_1;
    }
    $$_render_1();
    "
  `);
});

test('dynamic', () => {
  expect(t(`<svg var:foo={getFoo()} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "--foo", $1);
        return $_r_1;
    }
    $$_render_1({ $1: getFoo() });
    "
  `);
});

test('multiple dynamic', () => {
  expect(t(`<svg var:foo={getFoo()} var:bar={getBar()}/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "--foo", $1);
        $$_style($_r_1, "--bar", $2);
        return $_r_1;
    }
    $$_render_1({ $1: getFoo(), $2: getBar() });
    "
  `);
});

test('signal', () => {
  expect(t(`<svg $var:foo={foo} />`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "--foo", $1);
        return $_r_1;
    }
    $$_render_1({ $1: foo });
    "
  `);
});

test('multiple signals', () => {
  expect(t(`<svg $var:foo={foo} $var:bar={bar}/>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_style } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<svg></svg>");
    function $$_render_1({ $1, $2 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_style($_r_1, "--foo", $1);
        $$_style($_r_1, "--bar", $2);
        return $_r_1;
    }
    $$_render_1({ $1: foo, $2: bar });
    "
  `);
});
