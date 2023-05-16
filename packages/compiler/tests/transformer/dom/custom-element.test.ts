import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile', () => {
  const result = t(`<v-foo />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_setup_custom_element($$_root);

      return $$_root;
    })()"
  `);
});

it('should compile observable expression', () => {
  const result = t(`<v-foo>{id()}</v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_setup_custom_element, $$_insert, $$_scoped, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_scoped(() => {
        $$_insert($$_root, id);
      }, $$_setup_custom_element($$_root));

      return $$_root;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<v-foo><div>{id}</div><v-bar><v-baz /></v-bar></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_setup_custom_element, $$_insert, $$_scoped, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d><div></div><v-bar mk-d><v-baz mk-d></v-baz></v-bar></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.nextSibling,
        $$_el_3 = $$_el_2.firstChild;

      $$_scoped(() => {
        $$_insert($$_el, id);
        $$_scoped(() => {
          $$_setup_custom_element($$_el_3);
        }, $$_setup_custom_element($$_el_2));
      }, $$_setup_custom_element($$_root));

      return $$_root;
    })()"
  `);
});

it('should compile with jsx attributes', () => {
  const result = t(
    `<v-foo foo={10} bar={id()} $prop:foo={id()} $class:foo={true} $cssvar:foo={10} $on:click={handler} />`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_effect, $$_attr, $$_class, $$_listen, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo foo=\\"10\\" mk-d style=\\"--foo: 10\\"></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_effect(() => $$_attr($$_root, \\"bar\\", id()));
      $$_class($$_root, \\"foo\\", true);
      $$_listen($$_root, \\"click\\", handler);
      $$_setup_custom_element($$_root, { foo: id });

      return $$_root;
    })()"
  `);
});

it('should compile as child', () => {
  const result = t(
    `<div><div>Foo</div><v-foo $prop:foo={props.foo}>{id()}</v-foo><div>{id()}</div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_setup_custom_element, $$_insert, $$_scoped, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div><v-foo mk-d></v-foo><div></div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.nextSibling,
        $$_el_3 = $$_el_2.nextSibling;

      $$_scoped(() => {
        $$_insert($$_el_2, id);
      }, $$_setup_custom_element($$_el_2, { foo: props.foo }));
      $$_insert($$_el_3, id);

      return $$_root;
    })()"
  `);
});

it('should compile with inner html', () => {
  const result = t(`<v-foo $prop:innerHTML="<div>Foo</div>"><div>Bar</div></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<v-foo mk-d></v-foo>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.innerHTML = \\"<div>Foo</div>\\";
      $$_setup_custom_element($$_root, { innerHTML: true });

      return $$_root;
    })()"
  `);
});
