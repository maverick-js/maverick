import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile empty host element', () => {
  const result = t(`<HostElement />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element } from \\"maverick.js/dom\\";
    null"
  `);
});

it('should compile attribute', () => {
  const result = t(`<HostElement foo={id} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_attr } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_attr($$_host, \\"foo\\", id);

      return $$_host;
    })()"
  `);
});

it('should compile $prop', () => {
  const result = t(`<HostElement $prop:foo="1" />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_host.foo = \\"1\\";

      return $$_host;
    })()"
  `);
});

it('should compile $class', () => {
  const result = t(`<HostElement $class:foo="..." />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_class } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_class($$_host, \\"foo\\", \\"...\\");

      return $$_host;
    })()"
  `);
});

it('should compile $style', () => {
  const result = t(`<HostElement $style:foo="..." />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_style } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_style($$_host, \\"foo\\", \\"...\\");

      return $$_host;
    })()"
  `);
});

it('should compile $cssvar', () => {
  const result = t(`<HostElement $cssvar:foo="..." />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_style } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_style($$_host, \\"--foo\\", \\"...\\");

      return $$_host;
    })()"
  `);
});

it('should compile $on', () => {
  const result = t(`<HostElement $on:foo={handler} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_listen } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_listen($$_host, \\"foo\\", handler);

      return $$_host;
    })()"
  `);
});

it('should compile $ref', () => {
  const result = t(`<HostElement $ref={handler} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_ref } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_ref($$_host, handler);

      return $$_host;
    })()"
  `);
});

it('should compile $use', () => {
  const result = t(`<HostElement $use:foo={[arg1, arg2]} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_directive } from \\"maverick.js/dom\\";
    (() => {
      const $$_host = $$_host_element();

      $$_directive($$_host, foo, [arg1, arg2]);

      return $$_host;
    })()"
  `);
});

it('should compile with children', () => {
  const result = t(`<HostElement><div>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div>Foo</div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div>Bar</div>\`);
    [$$_clone($$_templ), $$_clone($$_templ_2)]"
  `);
});

it('should compile with dynamic child', () => {
  const result = t(`<HostElement><div foo={id}>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_clone, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div>Foo</div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div>Bar</div>\`);
    [
      (() => {
        const $$_root = $$_clone($$_templ);

        $$_attr($$_root, \\"foo\\", id);

        return $$_root;
      })(),
      $$_clone($$_templ_2),
    ]"
  `);
});

it('should compile with attrs and children', () => {
  const result = t(`<HostElement foo={id}><div>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_attr, $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div>Foo</div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div>Bar</div>\`);
    (() => {
      const $$_host = $$_host_element();

      $$_attr($$_host, \\"foo\\", id);

      return [$$_clone($$_templ), $$_clone($$_templ_2)];
    })()"
  `);
});

it('should compile with attrs and dynamic child', () => {
  const result = t(`<HostElement foo={id}><div foo={id}>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_attr, $$_clone, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div>Foo</div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div>Bar</div>\`);
    (() => {
      const $$_host = $$_host_element();

      $$_attr($$_host, \\"foo\\", id);

      return [
        (() => {
          const $$_root = $$_clone($$_templ);

          $$_attr($$_root, \\"foo\\", id);

          return $$_root;
        })(),
        $$_clone($$_templ_2),
      ];
    })()"
  `);
});
