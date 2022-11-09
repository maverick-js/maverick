import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div style=\\"foo: bar\\"></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_style($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should group multiple static $style expressions', () => {
  const result = t(
    `<div style="foo: a; " $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div style=\\"foo: a;foo: b;bar: true\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_style($$_root, \\"baz\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable $style expression', () => {
  const result = t(`<div $style:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_style($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});
