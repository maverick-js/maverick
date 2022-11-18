import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile root component', () => {
  const result = t(`<Component />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component)"
  `);
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});
