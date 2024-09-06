import { domH } from '../../../transform';

test('no children', () => {
  expect(domH(`<></>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1() {
        return [];
    }
    $$_fragment_1();
    "
  `);
});

test('one static child element', () => {
  expect(domH(`<><div /></>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div></div>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    function $$_fragment_1() {
        return [$$_render_1()];
    }
    $$_fragment_1();
    "
  `);
});

test('multiple static child elements', () => {
  expect(domH(`<><div /><span /></>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div></div>"), $_t_2 = $$_create_template("<!$><span></span>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    function $$_render_2() {
        let [$_r, $_w] = $$_create_walker($_t_2);
        return $_r;
    }
    function $$_fragment_1() {
        return [$$_render_1(), $$_render_2()];
    }
    $$_fragment_1();
    "
  `);
});

test('one dynamic child element', () => {
  expect(domH(`<><div on:click={onClick} /></>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div></div>");
    function $$_render_1({ $1 }) {
        let [$_r, $_w] = $$_create_walker($_t_1);
        $$_listen($_r, "click", $1);
        return $_r;
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
  expect(domH(`<><div on:click={onA} /><span on:click={onB} /></>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div></div>"), $_t_2 = $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let [$_r, $_w] = $$_create_walker($_t_1);
        $$_listen($_r, "click", $1);
        return $_r;
    }
    function $$_render_2({ $2 }) {
        let [$_r, $_w] = $$_create_walker($_t_2);
        $$_listen($_r, "click", $2);
        return $_r;
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
  expect(domH(`<>{"foo"}</>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1({ $1 }) {
        return [$1];
    }
    $$_fragment_1({ $1: "foo" });
    "
  `);
});

test('one dynamic child expression', () => {
  expect(domH(`<>{a()}</>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1({ $2 }) {
        return [$1];
    }
    $$_fragment_1({ $2: () => a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(domH(`<>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</>`))
    .toMatchInlineSnapshot(`
      "import { $$_create_walker, $$_listen, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
      let $_t_1 = $$_create_template("<!$><div></div>"), $_t_2 = $$_create_template("<!$><span></span>");
      function $$_render_1({ $1 }) {
          let [$_r, $_w] = $$_create_walker($_t_1);
          $$_listen($_r, "click", $1);
          return $_r;
      }
      function $$_render_2({ $2 }) {
          let [$_r, $_w] = $$_create_walker($_t_2);
          $$_listen($_r, "click", $2);
          return $_r;
      }
      function $$_fragment_1({ $5, $6 }) {
          return [$3, $4];
      }
      $$_fragment_1({ $5: () => a() ? $$_render_1({ $1: onA }) : null, $6: () => b() ? $$_render_2({ $2: onB }) : null });
      $$_delegate_events(["click"]);
      "
    `);
});

test('import', () => {
  expect(
    domH(`
import { Fragment } from "maverick.js";

<Fragment slot="apples">
  <div></div>
  <span></span>
</Fragment>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_component, Fragment, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<!$><div></div>"), $_t_2 = $$_create_template("<!$><span></span>");
    function $$_render_1() {
        let [$_r, $_w] = $$_create_walker($_t_1);
        return $_r;
    }
    function $$_render_2() {
        let [$_r, $_w] = $$_create_walker($_t_2);
        return $_r;
    }
    function $$_fragment_1() {
        return [$$_render_1(), $$_render_2()];
    }
    function $$_render_3() {
        let $_c_1 = $$_create_component(Fragment, null, {
            "default": () => $$_fragment_1()
        });
        return $_c_1;
    }
    "
  `);
});
