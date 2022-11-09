import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile shorthand boolean attribute', () => {
  const result = t(`<button disabled />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><button disabled=\\\\\\"\\\\\\"></button>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attributes', () => {
  const result = t(`<div class="foo bar" style="baz daz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div class=\\\\\\"foo bar\\\\\\" style=\\\\\\"baz daz\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attribute (number)', () => {
  const result = t(`<div foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div foo=\\\\\\"10\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attribute (boolean)', () => {
  const result = t(`<div foo={true} bar={false}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div foo=\\\\\\"true\\\\\\" bar=\\\\\\"false\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attribute (template string)', () => {
  const result = t(`<div foo={\`bar-baz\`} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div foo=\\\\\\"bar-baz\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile dynamic attribute', () => {
  const result = t(`<div foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_attr(\\"foo\\", id))"
  `);
});

it('should compile observable attribute', () => {
  const result = t(`<div foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_attr(\\"foo\\", id))"
  `);
});
