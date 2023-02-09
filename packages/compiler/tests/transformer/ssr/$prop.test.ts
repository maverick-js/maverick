import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should _not_ compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"><div>Foo</div><div>Bar</div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_inject_html, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>\\", \\"</div>\\"];
    $$_ssr($$_templ, $$_inject_html(\\"baz\\"))"
  `);
});
