import { react } from '../../transform';

test('import', () => {
  expect(
    react(`
import { Portal } from "maverick.js";

<Portal to="body">
  <div></div>
</Portal>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_h, $$_component, Portal } from "@maverick-js/react";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div");
    let $_component_1 = $$_component(Portal, {
        "to": "body"
    }, null, {
        "default": () => $_static_node_1
    });
    $_component_1
    "
  `);
});
