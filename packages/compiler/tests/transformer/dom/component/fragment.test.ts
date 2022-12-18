import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should insert fragmented child components', () => {
  const result = t(`
<div>
  <>
    <Component />
    <Component />
    <div>Foo</div>
    <Component />
  </>
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});

it('should compile component child fragment', () => {
  const result = t(
    `
<Component>
  <>
  <div id="foo">{id()}</div>
  <div id="bar">{id()}</div>
  {id}
  <div></div>
  {id}
  </>
</Component>
`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"foo\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"bar\\"></div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);

    $$_create_component(Component, {
      get $children() {
        return [
          (() => {
            const $$_root = $$_clone($$_templ);

            $$_insert($$_root, id);

            return $$_root;
          })(),
          (() => {
            const $$_root = $$_clone($$_templ_2);

            $$_insert($$_root, id);

            return $$_root;
          })(),
          id,
          $$_clone($$_templ_3),
          id,
        ];
      },
    })
    "
  `);
});
