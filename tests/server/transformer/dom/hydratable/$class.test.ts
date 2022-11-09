import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_class, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_class($$_root, \\"foo\\", true);

      return $$_root;
    })()"
  `);
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()} $class:bar={props.id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_class, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_class($$_root, \\"foo\\", id);
      $$_class($$_root, \\"bar\\", () => props.id);

      return $$_root;
    })()"
  `);
});
