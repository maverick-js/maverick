import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile child expression', () => {
  const result = t(`<div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_root;
    })()"
  `);
});

it('should compile sibling expression', () => {
  const result = t(`<div>{id}<div></div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$><div></div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_root;
    })()"
  `);
});

it('should compile observable child expression', () => {
  const result = t(`<div>{id()}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_root;
    })()"
  `);
});

it('should compile conditional element expression ', () => {
  const result = t(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_create_template, $$_next_template, $$_insert_at_marker } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id > 10 && $$_next_template($$_templ_2));

      return $$_root;
    })()"
  `);
});

it('should compile observable conditional element expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id()}></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template, $$_insert_at_marker } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, () =>
        id() > 10 && (() => {
          const [$$_root, $$_walker] = $$_create_walker($$_templ_2);

          $$_listen($$_root, \\"click\\", id());

          return $$_root;
        })());

      return $$_root;
    })()"
  `);
});

it('should compile fragment containing expression', () => {
  const result = t(`<><div id="a"></div><div id="b">{id()}</div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template, $$_create_walker, $$_clone, $$_insert_at_marker } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"><!$></div>\`);
    [
      $$_next_template($$_templ),
      (() => {
        const [$$_root, $$_walker] = $$_create_walker($$_templ_2),
          $$_expr = $$_walker.nextNode();

        $$_insert_at_marker($$_expr, id);

        return $$_root;
      })(),
    ]"
  `);
});
