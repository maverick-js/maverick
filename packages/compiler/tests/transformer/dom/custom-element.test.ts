import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile', () => {
  const result = t(`<CustomElement $element={DEFINITION} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_element, $$_setup_custom_element } from \\"maverick.js/dom\\";
    (() => {
      const $$_el = $$_create_element(DEFINITION.tagName);

      $$_setup_custom_element($$_el, DEFINITION);

      return $$_el;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<CustomElement $element={DEFINITION}><div>{id}</div></CustomElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_element, $$_clone, $$_insert, $$_create_template, $$_setup_custom_element } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_create_element(DEFINITION.tagName);

      $$_setup_custom_element($$_el, DEFINITION, {
        $children() {
          const $$_root = $$_clone($$_templ);

          $$_insert($$_root, id);

          return $$_root;
        },
      });

      return $$_el;
    })()"
  `);
});

it('should compile with jsx attributes', () => {
  const result = t(
    `<CustomElement foo={10} $prop:foo={id()} $class:foo={true} $cssvar:foo={10} $on:click={handler} $element={DEFINITION} />`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_element, $$_attr, $$_class, $$_style, $$_listen, $$_setup_custom_element } from \\"maverick.js/dom\\";
    (() => {
      const $$_el = $$_create_element(DEFINITION.tagName);

      $$_attr($$_el, \\"foo\\", 10);
      $$_class($$_el, \\"foo\\", true);
      $$_style($$_el, \\"--foo\\", 10);
      $$_listen($$_el, \\"click\\", handler);
      $$_setup_custom_element($$_el, DEFINITION, { foo: id() });

      return $$_el;
    })()"
  `);
});

it('should compile as child', () => {
  const result = t(
    `<div><div>Foo</div><CustomElement $prop:foo={props.foo} $element={DEFINITION}>{id()}</CustomElement><div></div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_element, $$_setup_custom_element, $$_insert, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div><div></div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_create_element(DEFINITION.tagName),
        $$_el_2 = $$_root.firstChild,
        $$_el_3 = $$_el_2.nextSibling;

      $$_setup_custom_element($$_el, DEFINITION, {
        foo: props.foo,
        $children() {
          return id();
        },
      });
      $$_insert($$_root, $$_el, $$_el_3);

      return $$_root;
    })()"
  `);
});

it('shoud compile with inner html', () => {
  const result = t(`<CustomElement $prop:innerHTML="<div>Foo</div>" $element={DEFINITION} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_element, $$_setup_custom_element } from \\"maverick.js/dom\\";
    (() => {
      const $$_el = $$_create_element(DEFINITION.tagName);

      $$_setup_custom_element($$_el, DEFINITION, { innerHTML: \\"<div>Foo</div>\\" });

      return $$_el;
    })()"
  `);
});
