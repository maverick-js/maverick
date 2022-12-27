import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile static $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_class($$_root, \\"foo\\", true);

      return $$_root;
    })()"
  `);
});

it('should compile dynamic $class expression', () => {
  const result = t(`<div $class:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_effect, $$_class, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_effect(() => $$_class($$_root, \\"foo\\", id()));

      return $$_root;
    })()"
  `);
});
