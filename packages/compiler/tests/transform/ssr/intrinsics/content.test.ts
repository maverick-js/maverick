import { ssr } from '../../transform';

test('static', () => {
  expect(ssr(`<div innerHTML="<div></div>"><span /></div>`)).toMatchInlineSnapshot(`
    ""<div><div></div></div>";
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<div innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><div>", "</div>"];
    $$_ssr($$_template_1, [content]);
    "
  `);
});

test('signal', () => {
  expect(ssr(`<div $innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_ssr } from "@maverick-js/ssr";
    let $$_template_1 = ["<!$><div>", "</div>"];
    $$_ssr($$_template_1, [content]);
    "
  `);
});
