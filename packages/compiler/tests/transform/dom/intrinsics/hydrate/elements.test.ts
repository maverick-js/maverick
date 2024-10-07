import { domH } from '../../../transform';

test('no children', () => {
  expect(domH(`<div></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div></div>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('text child', () => {
  expect(domH(`<div>Foo</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div>Foo</div>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('one static child element', () => {
  expect(domH(`<div><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><span></span></div>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('multiple static child elements', () => {
  expect(domH(`<div><span></span><span></span></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><span></span><span></span></div>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child element', () => {
  expect(domH(`<div><span on:click={onClick} /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_next_element, $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><!$><span></span></div>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_el_1 = $$_next_element($_walker_1);
        $$_listen($_el_1, "click", $1);
        return $_root_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(
    domH(`<div><span on:click={onA}><div on:click={onB} /></span><span on:click={onC} /></div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_next_element, $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><!$><span><!$><div></div></span><!$><span></span></div>");
    function $$_render_1({ $1, $2, $3 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_el_1 = $$_next_element($_walker_1), $_el_2 = $$_next_element($_walker_1), $_el_3 = $$_next_element($_walker_1);
        $$_listen($_el_1, "click", $1);
        $$_listen($_el_2, "click", $2);
        $$_listen($_el_3, "click", $3);
        return $_root_1;
    }
    $$_render_1({ $1: onA, $2: onB, $3: onC });
    "
  `);
});

test('one static child expression', () => {
  expect(domH(`<div>{"foo"}</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div>foo</div>");
    function $$_render_1() {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1);
        return $_root_1;
    }
    $$_render_1();
    "
  `);
});

test('one dynamic child expression', () => {
  expect(domH(`<div>{a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_insert_at_marker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><!$></div>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_1), $_marker_1 = $_walker_1.nextNode();
        $$_insert_at_marker($_marker_1, $1);
        return $_root_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    domH(`<div>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_listen, $$_insert_at_marker, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<!$><div><!$><!$></div>"), $_template_2 = /* @__PURE__ */ $$_create_template("<!$><div></div>"), $_template_3 = /* @__PURE__ */ $$_create_template("<!$><span></span>");
    function $$_render_1({ $1 }) {
        let [$_root_1, $_walker_1] = $$_create_walker($_template_2);
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_render_2({ $3 }) {
        let [$_root_2, $_walker_2] = $$_create_walker($_template_3);
        $$_listen($_root_2, "click", $3);
        return $_root_2;
    }
    function $$_render_3({ $2, $4 }) {
        let [$_root_3, $_walker_3] = $$_create_walker($_template_1), $_marker_1 = $_walker_3.nextNode(), $_marker_2 = $_walker_3.nextNode();
        $$_insert_at_marker($_marker_1, $2());
        $$_insert_at_marker($_marker_2, $4());
        return $_root_3;
    }
    $$_render_3({ $2: () => a() ? $$_render_1({ $1: onA }) : null, $4: () => b() ? $$_render_2({ $3: onB }) : null });
    "
  `);
});
