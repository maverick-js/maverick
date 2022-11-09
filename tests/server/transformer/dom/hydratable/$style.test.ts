import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"foo: bar\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

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
    "import { $$_create_walker, $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"foo: a;foo: b;bar: true\\"></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_style($$_root, \\"baz\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable $style expression', () => {
  const result = t(`<div $style:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_style($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});
