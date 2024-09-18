import { ssr } from '../../transform';

test('static innerHTML', () => {
  expect(ssr(`<div innerHTML="<div></div>"><span /></div>`)).toMatchInlineSnapshot(`
    ""<div><div></div></div>";
    "
  `);
});

test('dynamic innerHTML', () => {
  expect(ssr(`<div innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<!$><div>", "</div>"];
    $$_ssr($$_t_1, [content]);
    "
  `);
});

test('$innerHTML', () => {
  expect(ssr(`<div $innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_t_1 = ["<!$><div>", "</div>"];
    $$_ssr($$_t_1, [content]);
    "
  `);
});
