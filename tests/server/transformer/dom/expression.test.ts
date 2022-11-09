import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile child expression', () => {
  const result = t(`<div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, id);

      return $$_root;
    })()"
  `);
});

it('should compile sibling expression', () => {
  const result = t(`<div><div></div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div></div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, id, null);

      return $$_root;
    })()"
  `);
});

it('should compile middle expression', () => {
  const result = t(`<div><div></div>{id}<div></div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div></div><div></div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.nextSibling;

      $$_insert($$_root, id, $$_el_2);

      return $$_root;
    })()"
  `);
});

it('should compile observable child expression', () => {
  const result = t(`<div>{id() + 10}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, () => id() + 10);

      return $$_root;
    })()"
  `);
});

it('should compile property access expression', () => {
  const result = t(`<div foo={props.id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_attr($$_root, \\"foo\\", () => props.id);

      return $$_root;
    })()"
  `);
});

it('should compile conditional element expression ', () => {
  const result = t(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template, $$_insert } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"b\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, id > 10 && $$_clone($$_templ_2));

      return $$_root;
    })()"
  `);
});

it('should compile observable conditional element expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id()}></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_template, $$_insert } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"b\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, () =>
        id() > 10 && (() => {
          const $$_root = $$_clone($$_templ_2);

          $$_listen($$_root, \\"click\\", id());

          return $$_root;
        })());

      return $$_root;
    })()"
  `);
});
