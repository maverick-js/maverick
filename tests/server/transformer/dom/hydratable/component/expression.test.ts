import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_peek } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);

    function Component() {
      return id > 10
      ? $$_peek(() =>
        (() => {
          const [$$_root, $$_walker] = $$_create_walker($$_templ),
            $$_expr = $$_walker.nextNode();

          $$_insert_at_marker($$_expr, id);

          return $$_root;
        })()
      )
      : 20;
    }
      "
  `);
});

it('should compile dynamic conditional expression ', () => {
  const result = t(`
function Component() {
  return id() > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_peek } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);

    function Component() {
      return (() =>
      id() > 10
        ? $$_peek(() =>
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })()
        )
        : 20);
    }
      "
  `);
});

it('should forward single call expression', () => {
  const result = t(`<Component>{() => <div>{id()}</div>}</Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    $$_create_component(Component, {
      get $children() {
        return () =>
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })();
      },
    })"
  `);
});

it('should forward multiple call expressions', () => {
  const result = t(`
<Component>
  {() => <div>{id()}</div>}
  {() => <div>{id()}</div>}
</Component>
`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_templ;

    $$_create_component(Component, {
      get $children() {
        return [() =>
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })(), () =>
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ_2),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })()];
      },
    })
    "
  `);
});
