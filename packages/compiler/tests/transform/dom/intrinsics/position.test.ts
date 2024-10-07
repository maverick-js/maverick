import { dom } from '../../transform';

test('children', () => {
  expect(dom(`<div><span on:click />A<span on:click />B<span on:click /></div>`))
    .toMatchInlineSnapshot(`
      "import { $$_listen, $$_child, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<div><span></span>A<span></span>B<span></span></div>");
      function $$_render_1({ $1, $2, $3 }) {
          let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild, $_node_2 = $$_child($_root_1, 2), $_node_3 = $$_child($_root_1, 4);
          $$_listen($_node_1, "click", $1);
          $$_listen($_node_2, "click", $2);
          $$_listen($_node_3, "click", $3);
          return $_root_1;
      }
      $$_render_1({ $1: true, $2: true, $3: true });
      "
    `);
});

test('grandchildren', () => {
  expect(dom(`<div><div><span on:click /><span on:click /><span on:click /></div></div>`))
    .toMatchInlineSnapshot(`
      "import { $$_listen, $$_child, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<div><div><span></span><span></span><span></span></div></div>");
      function $$_render_1({ $1, $2, $3 }) {
          let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild, $_node_2 = $_node_1.firstChild, $_node_3 = $$_child($_node_1, 1), $_node_4 = $$_child($_node_1, 2);
          $$_listen($_node_2, "click", $1);
          $$_listen($_node_3, "click", $2);
          $$_listen($_node_4, "click", $3);
          return $_root_1;
      }
      $$_render_1({ $1: true, $2: true, $3: true });
      "
    `);
});

test('insert before', () => {
  expect(dom(`<div>{a()}<div /></div>`)).toMatchInlineSnapshot(`
    "import { $$_insert, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><div></div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild;
        $$_insert($_root_1, $1, $_node_1);
        return $_root_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});
