import { t } from '../../transform';

test('import', () => {
  expect(
    t(`
import { Portal } from "maverick.js";

<Portal to="body">
  <div></div>
</Portal>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_create_component, Portal } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1() {
        let $_c_1 = $$_create_component(Portal, { "to": "body" }, { "default": () => $$_clone($_t_1) });
        return $_c_1;
    }
    "
  `);
});
