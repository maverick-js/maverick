import { ssr } from '../../transform';

test('import', () => {
  expect(
    ssr(`
import { Host } from '@maverick-js/core';

<Host autofocus $title={title} class:foo var:foo={10} on:click={onClick}>
  <div>...</div>
</Host>
    `),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component, Host } from "@maverick-js/ssr";
    $$_create_component(Host, {
        "autofocus": true,
        "$title": title
    }, {
        "default": () => "<div>...</div>"
    }, {
        $class: {
            "foo": true
        },
        $var: {
            "--foo": 10
        }
    });
    "
  `);
});
