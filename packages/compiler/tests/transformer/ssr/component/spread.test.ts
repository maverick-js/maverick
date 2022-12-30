import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile component with spread', () => {
  const result = t(`<Component {...props} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component, props)"
  `);
});

it('should compile component with multiple spreads', () => {
  const result = t(`<Component {...props} {...propsTwo} {...propsThree} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/ssr\\";
    $$_create_component(Component, $$_merge_props(props, propsTwo, propsThree))"
  `);
});

it('should compile component with props and spread', () => {
  const result = t(`<Component foo="..." {...props} bar={id() + 10} baz={id} {...propsTwo} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/ssr\\";
    $$_create_component(Component, $$_merge_props({ foo: \\"...\\" }, props, { bar: id() + 10, baz: id }, propsTwo))"
  `);
});
