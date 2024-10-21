import { dom } from '../../transform';

test('import', () => {
  expect(
    dom(`
import { For } from '@maverick-js/core';

<For each={[0, 1, 2]}>
  {(item, index) => <div>{item} - {index}</div>}
</For>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_insert, $$_create_component, For, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div> - </div>");
    function $$_render_1({ $3, $4 }) {
        let $_root_1 = $_template_1(), $_node_1 = $_root_1.firstChild;
        $$_insert($_root_1, $3, $_node_1);
        $$_insert($_root_1, $4, null);
        return $_root_1;
    }
    function $$_render_2({ $1, $2, $5 }) {
        let $_component_1 = $$_create_component($2, {
            "each": $1
        }, null, {
            "default": $5
        });
        return $_component_1;
    }
    $$_render_2({ $1: [0, 1, 2], $2: For, $5: (item, index) => $$_render_1({ $3: item, $4: index }) });
    "
  `);
});
