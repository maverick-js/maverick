import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile', () => {
  const result = t(`<CustomElement $element={DEFINITION} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_next_custom_element, $$_setup_custom_element } from \\"maverick.js/dom\\";
    (() => {
      const $$_el = $$_next_custom_element(DEFINITION);

      $$_setup_custom_element($$_el, DEFINITION);

      return $$_el;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<CustomElement $element={DEFINITION}><div>{id}</div></CustomElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_next_custom_element, $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_children, $$_setup_custom_element } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const $$_el = $$_next_custom_element(DEFINITION);

      $$_setup_custom_element($$_el, DEFINITION, {
        $children: $$_children(() => {
          const [$$_root, $$_walker] = $$_create_walker($$_templ),
            $$_expr = $$_walker.nextNode();

          $$_insert_at_marker($$_expr, id);

          return $$_root;
        }),
      });

      return $$_el;
    })()"
  `);
});

it('should compile as child', () => {
  const result = t(
    `<div><div>Foo</div><CustomElement $prop:foo={props.foo} $element={DEFINITION}>{id()}</CustomElement><div>Bar</div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_next_custom_element, $$_children, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><div>Foo</div><!$><div>Bar</div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_el = $$_next_custom_element(DEFINITION, $$_walker);

      $$_setup_custom_element($$_el, DEFINITION, {
        foo: props.foo,
        $children: $$_children(() => {
          return id();
        }),
      });

      return $$_root;
    })()"
  `);
});
