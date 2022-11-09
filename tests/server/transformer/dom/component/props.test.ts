import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={10} boo={true} baz={id()} qux />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: \\"a\\", bar: 10, boo: true, baz: id, qux: true })"
  `);
});
