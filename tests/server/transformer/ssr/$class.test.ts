import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile static class attribute', () => {
  const result = t(`<div class="foo bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div class=\\\\\\"foo bar\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile dynamic class attribute', () => {
  const result = t(`<div class={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(id))"
  `);
});

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(\\"\\", { \\"foo\\": true }))"
  `);
});

it('should compile multiple $class expressions', () => {
  const result = t(
    `<div class="foo bar" $class:foo={true} $class:bar={false} $class:baz={true}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(\\"foo bar\\", { \\"foo\\": true, \\"bar\\": false, \\"baz\\": true }))"
  `);
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(\\"\\", { \\"foo\\": id }))"
  `);
});
