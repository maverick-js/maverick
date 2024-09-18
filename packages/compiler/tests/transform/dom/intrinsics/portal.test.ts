import { dom } from '../../transform';

test('import', () => {
  expect(
    dom(`
import { Portal } from "maverick.js";

<Portal to="body">
  <div></div>
</Portal>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_component, Portal, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div></div>");
    function $$_render_1() {
        let $_component_1 = $$_create_component(Portal, {
            "to": "body"
        }, {
            "default": () => $$_clone($_template_1)
        });
        return $_component_1;
    }
    $$_render_1();
    "
  `);
});
