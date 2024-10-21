import { dom } from '../../transform';

test('import', () => {
  expect(
    dom(`
import { Host } from '@maverick-js/core';

<Host autofocus $title={title} class:foo var:foo={10} on:click={onClick}>
  <div>...</div>
</Host>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_listen, $$_class, $$_style, $$_create_component, Host, $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div>...</div>");
    function $$_render_1({ $1, $2, $3 }) {
        let $_component_1 = $$_create_component($3, {
            "autofocus": true,
            "$title": $1
        }, $_target_1 => {
            $$_listen($_target_1, "click", $2);
        }, {
            "default": $_template_1
        }, host => {
            $$_class(host, "foo", true);
            $$_style(host, "--foo", 10);
        });
        return $_component_1;
    }
    $$_render_1({ $1: title, $2: onClick, $3: Host });
    "
  `);
});
