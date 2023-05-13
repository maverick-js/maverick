import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile', () => {
  const result = t(`<v-foo />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_setup_custom_element($$_root, null, $$_insert);

      return $$_root;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<v-foo><div>{id}</div><v-bar /></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_setup_custom_element, $$_children } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d></v-foo>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<v-bar mk-d></v-bar>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_setup_custom_element($$_root, {
        $children: $$_children(() => {
          return [
            (() => {
              const $$_root = $$_clone($$_templ_2);

              $$_insert($$_root, id);

              return $$_root;
            })(),
            (() => {
              const $$_root = $$_clone($$_templ_3);

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

it('should compile with jsx attributes', () => {
  const result = t(
    `<v-foo foo={10} $prop:foo={id()} $class:foo={true} $cssvar:foo={10} $on:click={handler} />`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_class, $$_listen, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo foo=\\"10\\" mk-d style=\\"--foo: 10\\"></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_class($$_root, \\"foo\\", true);
      $$_listen($$_root, \\"click\\", handler);
      $$_setup_custom_element($$_root, { foo: id }, $$_insert);

      return $$_root;
    })()"
  `);
});

it('should compile as child', () => {
  const result = t(
    `<div><div>Foo</div><v-foo $prop:foo={props.foo}>{id()}</v-foo><div></div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_children, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div><v-foo mk-d></v-foo><div></div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.nextSibling;

      $$_setup_custom_element($$_el_2, {
        foo: props.foo,
        $children: $$_children(() => {
          return id();
        }),
      }, $$_insert);

      return $$_root;
    })()"
  `);
});

it('shoud compile with inner html', () => {
  const result = t(`<v-foo $prop:innerHTML="<div>Foo</div>" />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.innerHTML = \\"<div>Foo</div>\\";
      $$_setup_custom_element($$_root, { innerHTML: true }, $$_insert);

      return $$_root;
    })()"
  `);
});
