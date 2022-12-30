import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={10} boo={true} baz={id()} qux id={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: \\"a\\", bar: 10, boo: true, baz: id(), qux: true, id: id() })"
  `);
});

it('should compile prop access expression', () => {
  const result = t(`<Component foo={props.id} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: props.id })"
  `);
});

it('should compile prop JSX template expression', () => {
  const result = t(`<Component foo={<div></div} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_create_component(Component, { foo: $$_clone($$_templ) })"
  `);
});

it('should compile prop JSX expression', () => {
  const result = t(`<Component foo={<div>{id()}</div} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_create_component(Component, {
      foo: (() => {
        const $$_root = $$_clone($$_templ);

        $$_insert($$_root, id);

        return $$_root;
      })(),
    })"
  `);
});
