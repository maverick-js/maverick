import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_children, $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, {
      $children: $$_children(() => {
        return \\"foo 10 bar 20 baz\\";
      }),
    })"
  `);
});

it('should compile component with element children', () => {
  const result = t(`<Component><div>Foo{id()}</div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_children, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div>Foo<!$></div>\`);
    $$_create_component(Component, {
      $children: $$_children(() => {
        const [$$_root, $$_walker] = $$_create_walker($$_templ),
          $$_expr = $$_walker.nextNode();

        $$_insert_at_marker($$_expr, id);

        return $$_root;
      }),
    })"
  `);
});

it('should compile component with props and children', () => {
  const result = t(`<Component foo={id}><div></div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template, $$_children, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    $$_create_component(Component, {
      foo: id,
      $children: $$_children(() => {
        return $$_next_template($$_templ);
      }),
    })"
  `);
});

it('should compile component child fragment', () => {
  const result = t(
    `
<Component>
  <>
  <div id="foo">{id()}</div>
  <div id="bar">{id()}</div>
  </>
</Component>
`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_children, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"foo\\"><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"bar\\"><!$></div>\`);

    $$_create_component(Component, {
      $children: $$_children(() => {
        return [
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })(),
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ_2),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })(),
        ];
      }),
    })
    "
  `);
});

it('should insert multiple child components', () => {
  const result = t(`
<div>
  <Component />
  <Component />
  <div>Foo</div>
  <Component />
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$><!$><div>Foo</div><!$></div>\`);

    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_comp = $$_walker.nextNode(),
        $$_comp_2 = $$_walker.nextNode(),
        $$_comp_3 = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));
      $$_insert_at_marker($$_comp_2, $$_create_component(Component));
      $$_insert_at_marker($$_comp_3, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});

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
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$><!$><div>Foo</div><!$></div>\`);

    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_comp = $$_walker.nextNode(),
        $$_comp_2 = $$_walker.nextNode(),
        $$_comp_3 = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));
      $$_insert_at_marker($$_comp_2, $$_create_component(Component));
      $$_insert_at_marker($$_comp_3, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});
