import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

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
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});

it('should compile nested components', () => {
  const result = t(`
<Component>
  Text
  <Foo>
    <div>{id()}</div>
  </Foo>
  <Bar />
</Component>
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);

    $$_create_component(Component, {
      get $children() {
        return [
          \\"Text\\",
          $$_create_component(Foo, {
            get $children() {
              const [$$_root, $$_walker] = $$_create_walker($$_templ),
                $$_expr = $$_walker.nextNode();

              $$_insert_at_marker($$_expr, id);

              return $$_root;
            },
          }),
          $$_create_component(Bar),
        ];
      },
    })
      "
  `);
});
