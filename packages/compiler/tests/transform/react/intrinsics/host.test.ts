import { react } from '../../transform';

test('import', () => {
  expect(
    react(`
import { Host } from '@maverick-js/core';

<Host autofocus $title={title} class:foo var:foo={10} on:click={onClick}>
  <div>...</div>
</Host>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_h, $$_IS_CLIENT, $$_component, Host } from "@maverick-js/react";
    import { $$_listen, $$_class, $$_style } from "@maverick-js/dom";
    let $_static_node_1 = /* @__PURE__ */ $$_h("div", null, "...");
    let $_component_1 = $$_component(Host, {
        "autofocus": true,
        "$title": title
    }, $$_IS_CLIENT && (instance => {
        $$_listen(instance, "click", onClick);
    }), {
        "default": () => $_static_node_1
    }, host => {
        $$_class(host, "foo", true);
        $$_style(host, "--foo", 10);
    });
    $_component_1
    "
  `);
});
