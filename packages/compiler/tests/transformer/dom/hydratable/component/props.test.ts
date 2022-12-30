import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={10} boo={true} baz={id()} qux id={id} id={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: \\"a\\", bar: 10, boo: true, baz: id(), qux: true, id: id, id: id() })"
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
  const result = t(`<Component foo={<div></div} bar={() => <div></div>}/>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_templ;
    $$_create_component(Component, { foo: $$_next_template($$_templ), bar: () => $$_next_template($$_templ_2) })"
  `);
});

it('should compile prop JSX expression', () => {
  const result = t(`<Component foo={<div>{id()}</div} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    $$_create_component(Component, {
      foo: (() => {
        const [$$_root, $$_walker] = $$_create_walker($$_templ),
          $$_expr = $$_walker.nextNode();

        $$_insert_at_marker($$_expr, id);

        return $$_root;
      })(),
    })"
  `);
});
