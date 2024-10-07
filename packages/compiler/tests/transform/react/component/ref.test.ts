import { dom } from '../../transform';

test('ref', () => {
  expect(dom('<Foo ref={ref} />')).toMatchInlineSnapshot(`
    "import { $$_ref, $$_create_component } from "@maverick-js/dom";
    function $$_render_1({ $1, $2 }) {
        let $_component_1 = $$_create_component($2, null, null, null, host => {
            $$_ref(host, $1);
        });
        return $_component_1;
    }
    $$_render_1({ $1: ref, $2: Foo });
    "
  `);
});
