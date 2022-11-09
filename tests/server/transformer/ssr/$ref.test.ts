import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should _not_ compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});
