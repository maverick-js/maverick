// fragment component
import { dom } from '../../transform';

test('no children', () => {
  expect(dom(`<div></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    $_template_1();
    "
  `);
});

test('text child', () => {
  expect(dom(`<div>Foo</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div>Foo</div>");
    $_template_1();
    "
  `);
});

test('one static child element', () => {
  expect(dom(`<div><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><span></span></div>");
    $_template_1();
    "
  `);
});

test('multiple static child elements', () => {
  expect(dom(`<div><span></span><span></span></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><span></span><span></span></div>");
    $_template_1();
    "
  `);
});

test('one dynamic child element', () => {
  expect(dom(`<div><span on:click={onClick} /></div>`)).toMatchInlineSnapshot(`
    "import { $$_listen, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><span></span></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild;
        $$_listen($_node_1, "click", $1);
        return $_root_1;
    }
    $$_render_1({ $1: onClick });
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(dom(`<div><span on:click={onA} /><span on:click={onB} /></div>`)).toMatchInlineSnapshot(`
    "import { $$_listen, $$_child, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><span></span><span></span></div>");
    function $$_render_1({ $1, $2 }) {
        let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild, $_node_2 = $$_child($_root_1, 1);
        $$_listen($_node_1, "click", $1);
        $$_listen($_node_2, "click", $2);
        return $_root_1;
    }
    $$_render_1({ $1: onA, $2: onB });
    "
  `);
});

test('one static child expression', () => {
  expect(dom(`<div>{"foo"}</div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div>foo</div>");
    $_template_1();
    "
  `);
});

test('one dynamic child expression', () => {
  expect(dom(`<div>{a()}</div>`)).toMatchInlineSnapshot(`
    "import { $$_insert, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1();
        $$_insert($_root_1, $1);
        return $_root_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    dom(`<div>{a() ? <div on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</div>`),
  ).toMatchInlineSnapshot(`
    "import { $$_listen, $$_insert, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>"), $_template_2 = $_template_1, $_template_3 = /* @__PURE__ */ $$_create_template("<span></span>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_2();
        $$_listen($_root_1, "click", $1);
        return $_root_1;
    }
    function $$_render_2({ $3 }) {
        let $_root_2 = $_template_3();
        $$_listen($_root_2, "click", $3);
        return $_root_2;
    }
    function $$_render_3({ $2, $4 }) {
        let $_root_3 = $_template_1();
        $$_insert($_root_3, $2, null);
        $$_insert($_root_3, $4, null);
        return $_root_3;
    }
    $$_render_3({ $2: a() ? $$_render_1({ $1: onA }) : null, $4: b() ? $$_render_2({ $3: onB }) : null });
    "
  `);
});
