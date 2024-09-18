import { dom } from '../../transform';

test('children', () => {
  expect(dom(`<div><span on:click /><span on:click /><span on:click /></div>`))
    .toMatchInlineSnapshot(`
      "import { $$_clone, $$_listen, $$_child, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<div><span></span><span></span><span></span></div>");
      function $$_render_1({ $1, $2, $3 }) {
          let $_root_1 = $$_clone($_template_1), $_el_1 = $_root_1.firstChild, $_el_2 = $$_child($_root_1, 1), $_el_3 = $$_child($_root_1, 2);
          $$_listen($_el_1, "click", $1);
          $$_listen($_el_2, "click", $2);
          $$_listen($_el_3, "click", $3);
          return $_root_1;
      }
      $$_render_1({ $1: true, $2: true, $3: true });
      $$_delegate_events(["click"]);
      "
    `);
});

test('grandchildren', () => {
  expect(dom(`<div><div><span on:click /><span on:click /><span on:click /></div></div>`))
    .toMatchInlineSnapshot(`
      "import { $$_clone, $$_listen, $$_child, $$_delegate_events, $$_create_template } from "@maverick-js/dom";
      let $_template_1 = /* @__PURE__ */ $$_create_template("<div><div><span></span><span></span><span></span></div></div>");
      function $$_render_1({ $1, $2, $3 }) {
          let $_root_1 = $$_clone($_template_1), $_el_1 = $_root_1.firstChild, $_el_2 = $$_child($_root_1, 1), $_el_3 = $$_child($_root_1, 2);
          $$_listen($_el_1, "click", $1);
          $$_listen($_el_2, "click", $2);
          $$_listen($_el_3, "click", $3);
          return $_root_1;
      }
      $$_render_1({ $1: true, $2: true, $3: true });
      $$_delegate_events(["click"]);
      "
    `);
});

test('insert before', () => {
  expect(dom(`<div>{a()}<div /></div>`)).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><div></div></div>");
    function $$_render_1({ $1 }) {
        let $_root_1 = $$_clone($_template_1), $_el_1 = $_root_1.firstChild;
        $$_insert($_root_1, $1, $_el_1);
        return $_root_1;
    }
    $$_render_1({ $1: a() });
    "
  `);
});
