import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile', () => {
  const result = t(`<v-foo />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d></v-foo>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_setup_custom_element($$_root, null, $$_insert);

      return $$_root;
    })()"
  `);
});

it('should compile inner HTML', () => {
  const result = t(`<v-foo $prop:innerHTML="<div>Foo</div>" />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_hydrating, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d></v-foo>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      if (!$$_hydrating) $$_root.innerHTML = \\"<div>Foo</div>\\";
      $$_setup_custom_element($$_root, { innerHTML: true }, $$_insert);

      return $$_root;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<v-foo><div>{id}</div><v-bar></v-bar></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_insert, $$_setup_custom_element, $$_children } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><v-foo mk-d></v-foo>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<!$><v-bar mk-d></v-bar>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_setup_custom_element($$_root, {
        $children: $$_children(() => {
          return [
            (() => {
              const [$$_root, $$_walker] = $$_create_walker($$_templ_2),
                $$_expr = $$_walker.nextNode();

              $$_insert_at_marker($$_expr, id);

              return $$_root;
            })(),
            (() => {
              const [$$_root, $$_walker] = $$_create_walker($$_templ_3);

              $$_setup_custom_element($$_root, null, $$_insert);

              return $$_root;
            })(),
          ];
        }),
      }, $$_insert);

      return $$_root;
    })()"
  `);
});

it('should compile as child', () => {
  const result = t(
    `<div><div>Foo</div><v-foo $prop:foo={props.foo}>{id()}</v-foo><div>Bar</div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_next_element, $$_children, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><div>Foo</div><!$><v-foo mk-d></v-foo><div>Bar</div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_el = $$_next_element($$_walker);

      $$_setup_custom_element($$_el, {
        foo: props.foo,
        $children: $$_children(() => {
          return id();
        }),
      }, $$_insert);

      return $$_root;
    })()"
  `);
});
