import { ssr } from '../../transform';

test('import', () => {
  expect(
    ssr(`
import { Portal } from "maverick.js";

<Portal to="body">
  <div></div>
</Portal>
`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, Portal } from "@maverick-js/ssr";
    "
  `);
});
