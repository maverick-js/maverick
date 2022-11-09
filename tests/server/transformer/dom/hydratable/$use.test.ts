import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile $use expression', () => {
  const result = t(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_directive, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_directive($$_root, directive, [1, 2, 3]);

      return $$_root;
    })()"
  `);
});
