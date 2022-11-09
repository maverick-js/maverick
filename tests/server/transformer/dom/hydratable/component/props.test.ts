import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: \\"a\\", bar: id })"
  `);
});
