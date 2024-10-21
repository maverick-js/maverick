import { react } from '../../transform';

test('import', () => {
  expect(
    react(`
import { For } from '@maverick-js/core';

function Foo() {
 return (
  <For each={[0, 1, 2]}>
    {(item, index) => <div>{item} - {index}</div>}
  </For>
 );
}
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_expression, $$_h, $$_component, For } from "@maverick-js/react";
    function Foo() {
        let $_component_1 = $$_component(For, {
            "each": [0, 1, 2]
        }, null, {
            "default": (item, index) => $$_h($_render_1.bind(null, item, index))
        });
        function $_render_1(item, index) {
            let $_node_1 = $$_expression(item), $_node_2 = $$_expression(index);
            return $$_h("div", null, $_node_1, " - ", $_node_2);
        }
        return $_component_1;
    }
    "
  `);
});
