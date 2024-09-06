// fragment component
import { dom } from '../../transform';

test('no children', () => {
  expect(dom(`<></>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1() {
        return [];
    }
    $$_fragment_1();
    "
  `);
});

test('one static child element', () => {
  expect(dom(`<><div /></>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_fragment_1() {
        return [$$_clone($_t_1)];
    }
    $$_fragment_1();
    "
  `);
});

test('multiple static child elements', () => {
  expect(dom(`<><div /><span /></>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>"), $_t_2 = $$_create_template("<span></span>");
    function $$_fragment_1() {
        return [$$_clone($_t_1), $$_clone($_t_2)];
    }
    $$_fragment_1();
    "
  `);
});

test('one dynamic child element', () => {
  expect(dom(`<><div on:click={onClick} /></>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $1);
        return $_r_1;
    }
    function $$_fragment_1({ $1 }) {
        return [$$_render_1({ $1 })];
    }
    $$_fragment_1({ $1: onClick });
    $$_delegate_events(["click"]);
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(dom(`<><div on:click={onA} /><span on:click={onB} /></>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>"), $_t_2 = $$_create_template("<span></span>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_listen($_r_1, "click", $1);
        return $_r_1;
    }
    function $$_render_2({ $2 }) {
        let $_r_2 = $$_clone($_t_2);
        $$_listen($_r_2, "click", $2);
        return $_r_2;
    }
    function $$_fragment_1({ $1, $2 }) {
        return [$$_render_1({ $1 }), $$_render_2({ $2 })];
    }
    $$_fragment_1({ $1: onA, $2: onB });
    $$_delegate_events(["click"]);
    "
  `);
});

test('one static child expression', () => {
  expect(dom(`<>{"foo"}</>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1({ $1 }) {
        return [$1];
    }
    $$_fragment_1({ $1: "foo" });
    "
  `);
});

test('one dynamic child expression', () => {
  expect(dom(`<>{a()}</>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1({ $1 }) {
        return [$1];
    }
    $$_fragment_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(dom(`<>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</>`))
    .toMatchInlineSnapshot(`
      "import { $$_clone, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
      let $_t_1 = $$_create_template("<div></div>"), $_t_2 = $$_create_template("<span></span>");
      function $$_render_1({ $1 }) {
          let $_r_1 = $$_clone($_t_1);
          $$_listen($_r_1, "click", $1);
          return $_r_1;
      }
      function $$_render_2({ $2 }) {
          let $_r_2 = $$_clone($_t_2);
          $$_listen($_r_2, "click", $2);
          return $_r_2;
      }
      function $$_fragment_1({ $3, $4 }) {
          return [$3, $4];
      }
      $$_fragment_1({ $3: a() ? $$_render_1({ $1: onA }) : null, $4: b() ? $$_render_2({ $2: onB }) : null });
      $$_delegate_events(["click"]);
      "
    `);
});

test('import', () => {
  expect(
    dom(`
import { Fragment } from "maverick.js";

<Fragment slot="apples">
  <div></div>
  <span></span>
</Fragment>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, Fragment, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>"), $_t_2 = $$_create_template("<span></span>");
    function $$_fragment_1() {
        return [$$_clone($_t_1), $$_clone($_t_2)];
    }
    function $$_render_1() {
        let $_c_1 = $$_create_component(Fragment, null, {
            "default": () => $$_fragment_1()
        });
        return $_c_1;
    }
    "
  `);
});
