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
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
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
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    function $$_render_2() {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
        return $_root_2;
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
    "import { $$_create_walker, $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_fragment_1({ $1 }) {
        return [$$_render_1({ $1 })];
    }
    $$_fragment_1({ $1: onClick });
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(domH(`<><div on:click={onA} /><span on:click={onB} /></>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_render_2({ $2 }) {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
        $$_listen($_root_2, "click", $2);
        return $_root_2;
    }
    function $$_fragment_1({ $1, $2 }) {
        return [$$_render_1({ $1 }), $$_render_2({ $2 })];
    }
    $$_fragment_1({ $1: onA, $2: onB });
    "
  `);
});

test('one static child expression', () => {
  expect(domH(`<>{"foo"}</>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1() {
        return ["foo"];
    }
    $$_fragment_1();
    "
  `);
});

test('one dynamic child expression', () => {
  expect(domH(`<>{a()}</>`)).toMatchInlineSnapshot(`
    "function $$_fragment_1({ $1 }) {
        return [$1()];
    }
    $$_fragment_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(domH(`<>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</>`))
    .toMatchInlineSnapshot(`
      "import { $$_create_walker, $$_listen, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
      function $$_render_1({ $1 }) {
          let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
          $$_listen($_root_1, "click", $1);
          return $_root_1;
      }
      function $$_render_2({ $3 }) {
          let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
          $$_listen($_root_2, "click", $3);
          return $_root_2;
      }
      function $$_fragment_1({ $2, $4 }) {
          return [$2(), $4()];
      }
      $$_fragment_1({ $2: () => a() ? $$_render_1({ $1: onA }) : null, $4: () => b() ? $$_render_2({ $3: onB }) : null });
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
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    function $$_render_2() {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_2);
        return $_root_2;
    }
    function $$_fragment_1() {
        return [$$_render_1(), $$_render_2()];
    }
    function $$_render_3({ $1 }) {
        let $_component_1 = $$_create_component($1, null, null, {
            "default": $$_fragment_1
        });
        return $_component_1;
    }
    $$_render_3({ $1: Fragment });
    "
  `);
});
