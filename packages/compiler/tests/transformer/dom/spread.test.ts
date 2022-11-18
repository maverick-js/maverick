import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile spread', () => {
  const result = t(`<div {...props} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_spread, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_spread($$_root, props);

      return $$_root;
    })()"
  `);
});

it('should compile SVG spread', () => {
  const result = t(`<svg {...props}></svg>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_spread, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<svg></svg>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_spread($$_root, props);

      return $$_root;
    })()"
  `);
});
