import { dom } from '../../transform';

test('import', () => {
  expect(
    dom(`
import { For } from 'maverick.js';

<For each={[0, 1, 2]}>
  {(item, index) => <div>{item} - {index}</div>}
</For>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_component, For, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div> - </div>");
    function $$_render_1({ $2, $3 }) {
        let $_root_1 = $$_clone($_template_1);
        $$_insert($_root_1, $2);
        $$_insert($_root_1, $3);
        return $_root_1;
    }
    function $$_render_2({ $1, $4 }) {
        let $_component_1 = $$_create_component(For, {
            "each": $1
        }, {
            "default": $4
        });
        return $_component_1;
    }
    $$_render_2({ $1: [0, 1, 2], $4: (item, index) => $$_render_1({ $2: item, $3: index }) });
    "
  `);
});
