import { ssr } from '../../transform';

test('import', () => {
  expect(
    ssr(`
import { Portal } from "@maverick-js/core";

<Portal to="body">
  <div></div>
</Portal>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, Portal } from "@maverick-js/ssr";
    $$_create_component(Portal, {
        "to": "body"
    }, {
        "default": () => "<div></div>"
    });
    "
  `);
});
