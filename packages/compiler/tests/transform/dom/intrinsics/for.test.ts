import { t } from '../../transform';

test('import', () => {
  expect(
    t(`
import { For } from 'maverick.js';

<For each={[0, 1, 2]}>
  {(item, index) => <div>{item} - {index}</div>}
</For>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_insert, $$_create_component, For } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div>- </div>");
    function $$_render_1({ $2, $3 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_insert($_r_1, $2);
        $$_insert($_r_1, $3);
        return $_r_1;
    }
    function $$_render_2({ $1, $4 }) {
        let $_c_1 = $$_create_component(For, { "each": $1 }, { "default": null });
        return $_c_1;
    }
    "
  `);
});
