import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile static style attribute', () => {
  const result = t(`<div style="foo: 1; bar: 2;"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div style=\\\\\\"foo: 1; bar: 2\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile dynamic style attribute', () => {
  const result = t(`<div style={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(id))"
  `);
});

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"foo\\": \\"bar\\" }))"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"foo\\": id }))"
  `);
});

it('should group multiple static $style expressions', () => {
  const result = t(
    `<div style="foo: a;" $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"foo: a;\\", { \\"foo\\": \\"b\\", \\"bar\\": true, \\"baz\\": id }))"
  `);
});

it('should compile observable $style expression', () => {
  const result = t(`<div style={id()} $style:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(id, { \\"foo\\": id }))"
  `);
});
