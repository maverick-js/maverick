import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"--foo\\": 10 }))"
  `);
});

it('should group multiple static $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $cssvar:foo={10} $cssvar:bar={'align-content'} $cssvar:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"pre: 10\\", { \\"--foo\\": 10, \\"--bar\\": \\"align-content\\", \\"--baz\\": id }))"
  `);
});

it('should group multiple static $style and $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $style:baz={\`content\`} $style:boo={20} $cssvar:foo={10} $cssvar:bar={'align-content'}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"pre: 10\\", { \\"baz\\": \`content\`, \\"boo\\": 20, \\"--foo\\": 10, \\"--bar\\": \\"align-content\\" }))"
  `);
});

it('should compile dynamic $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"--foo\\": id }))"
  `);
});

it('should compile observable $cssvar expression', () => {
  const result = t(`<div $cssvar:foo-bar={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"--foo-bar\\": id }))"
  `);
});
