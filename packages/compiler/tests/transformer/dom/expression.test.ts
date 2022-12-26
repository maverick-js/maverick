import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile expression', () => {
  const result = t(`id > 10 && <div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_peek } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    id > 10 && $$_peek(() =>
      (() => {
        const $$_root = $$_clone($$_templ);

        $$_insert($$_root, id);

        return $$_root;
      })()
    )"
  `);
});

it('should compile dynamic binary expression', () => {
  const result = t(`id() > 10 && <div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_peek } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() =>
      id() > 10 && $$_peek(() =>
        (() => {
          const $$_root = $$_clone($$_templ);

          $$_insert($$_root, id);

          return $$_root;
        })()
      ))"
  `);
});

it('should compile conditional expression', () => {
  const result = t(`1 > 2 ? <div>{id}</div> : props.id > 10 ? <div>Bar</div> : <div>Baz</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_peek } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div>Bar</div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<div>Baz</div>\`);
    (() =>
      1 > 2
        ? $$_peek(() =>
          (() => {
            const $$_root = $$_clone($$_templ);

            $$_insert($$_root, id);

            return $$_root;
          })()
        )
        : props.id > 10
        ? $$_clone($$_templ_2)
        : $$_clone($$_templ_3))"
  `);
});

it('should compile child jsx expression', () => {
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

it('should compile sibling jsx expression', () => {
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

it('should compile jsx expression', () => {
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

it('should compile dynamic child jsx expression', () => {
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

it('should compile conditional jsx expression ', () => {
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

it('should compile dynamic conditional jsx expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id}></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_template, $$_insert } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"b\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, () =>
        id() > 10 && (() => {
          const $$_root = $$_clone($$_templ_2);

          $$_listen($$_root, \\"click\\", id);

          return $$_root;
        })());

      return $$_root;
    })()"
  `);
});

it('should compile jsx function expression with return statement', () => {
  const result = t(`<div>{(id) => {
    return (<div $on:click={onClick}></div>)
  }}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_template, $$_insert } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_templ;
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, (id) => {
        const $$_root = $$_clone($$_templ_2);

        $$_listen($$_root, \\"click\\", onClick);

        return $$_root;
      });

      return $$_root;
    })()"
  `);
});
