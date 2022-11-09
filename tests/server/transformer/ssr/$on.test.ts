import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should _not_ compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should _not_ compile $oncapture expression', () => {
  const result = t(`<div $oncapture:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});
