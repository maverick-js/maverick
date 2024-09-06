import { ssr } from '../../transform';

test('innerHTML', () => {
  expect(ssr(`<div innerHTML="<div></div>"><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<div>", "</div>"];
    $$_ssr($$_t_1, ["<div></div>"]);
    "
  `);
});

test('$innerHTML', () => {
  expect(ssr(`<div $innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<div>", "</div>"];
    $$_ssr($$_t_1, [content]);
    "
  `);
});
