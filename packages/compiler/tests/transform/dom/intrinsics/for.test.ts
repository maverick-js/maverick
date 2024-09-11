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
    let $_t_1 = $$_create_template("<div>- </div>");
    function $$_render_1({ $2, $3 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_insert($_r_1, $2);
        $$_insert($_r_1, $3);
        return $_r_1;
    }
    function $$_render_2({ $1, $4 }) {
        let $_c_1 = $$_create_component(For, {
            "each": $1
        }, {
            "default": $4
        });
        return $_c_1;
    }
    $$_render_2({ $1: [0, 1, 2], $4: (item, index) => $$_render_1({ $2: item, $3: index }) });
    "
  `);
});
