import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile', () => {
  const result = t(`<v-foo />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d></v-foo>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_setup_custom_element($$_root);

      return $$_root;
    })()"
  `);
});

it('should compile observable expression', () => {
  const result = t(`<v-foo>{id(foo)}</v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_setup_custom_element, $$_insert_at_marker, $$_scoped, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d><!$></v-foo>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_scoped(() => {
        $$_insert_at_marker($$_expr, () => id(foo));
      }, $$_setup_custom_element($$_root));

      return $$_root;
    })()"
  `);
});

it('should compile inner HTML', () => {
  const result = t(`<v-foo $prop:innerHTML="<div>Foo</div>" />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_hydrating, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d></v-foo>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      if (!$$_hydrating) $$_root.innerHTML = \\"<div>Foo</div>\\";
      $$_setup_custom_element($$_root, { innerHTML: true });

      return $$_root;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<v-foo><div>{id}</div><v-bar>{id()}</v-bar></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_setup_custom_element, $$_insert_at_marker, $$_next_element, $$_scoped, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d><div><!$></div><!$><v-bar mk-d><!$></v-bar></v-foo>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode(),
        $$_el = $$_next_element($$_walker),
        $$_expr_2 = $$_walker.nextNode();

      $$_scoped(() => {
        $$_insert_at_marker($$_expr, id);
        $$_scoped(() => {
          $$_insert_at_marker($$_expr_2, id);
        }, $$_setup_custom_element($$_el));
      }, $$_setup_custom_element($$_root));

      return $$_root;
    })()"
  `);
});

it('should compile as child', () => {
  const result = t(
    `<div><div>Foo</div><v-foo $prop:foo={props.foo}>{id()}</v-foo><div>Bar</div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_next_element, $$_setup_custom_element, $$_insert_at_marker, $$_scoped, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><div>Foo</div><!$><v-foo mk-d><!$></v-foo><div>Bar</div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_el = $$_next_element($$_walker),
        $$_expr = $$_walker.nextNode();

      $$_scoped(() => {
        $$_insert_at_marker($$_expr, id);
      }, $$_setup_custom_element($$_el, { foo: props.foo }));

      return $$_root;
    })()"
  `);
});
