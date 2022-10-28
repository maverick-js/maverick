import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile root component', () => {
  const result = t(`<Component />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component)"
  `);
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);

    function Component() {
      return id > 10 ? (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_root;
    })() : 20;
    }
      "
  `);
});

it('should compile nested components', () => {
  const result = t(`
<Component>
  Text
  <Foo>
    <div>{id()}</div>
  </Foo>
  <Bar />
</Component>
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);

    $$_create_component(Component, {
      get children() {
        return [
          \\"Text\\",
          $$_create_component(Foo, {
            get children() {
              const [$$_root, $$_walker] = $$_create_walker($$_templ),
                $$_expr = $$_walker.nextNode();

              $$_insert_at_marker($$_expr, id);

              return $$_root;
            },
          }),
          $$_create_component(Bar),
        ];
      },
    })
      "
  `);
});

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: \\"a\\", bar: id })"
  `);
});

it('should compile component with spread', () => {
  const result = t(`<Component {...props} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, props)"
  `);
});

it('should compile component with multiple spreads', () => {
  const result = t(`<Component {...props} {...propsTwo} {...propsThree} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/dom\\";
    $$_create_component(Component, $$_merge_props(props, propsTwo, propsThree))"
  `);
});

it('should compile component with props and spread', () => {
  const result = t(`<Component foo="..." {...props} bar={id() + 10} baz={id} {...propsTwo} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/dom\\";
    $$_create_component(
      Component,
      $$_merge_props({ foo: \\"...\\" }, props, {
        get bar() {
          return id() + 10;
        },
        baz: id,
      }, propsTwo),
    )"
  `);
});

it('should compile component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, {
      get children() {
        return \\"foo 10 bar 20 baz\\";
      },
    })"
  `);
});

it('should compile component with element children', () => {
  const result = t(`<Component><div>Foo{id()}</div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div>Foo<!$></div>\`);
    $$_create_component(Component, {
      get children() {
        const [$$_root, $$_walker] = $$_create_walker($$_templ),
          $$_expr = $$_walker.nextNode();

        $$_insert_at_marker($$_expr, id);

        return $$_root;
      },
    })"
  `);
});

it('should compile component with props and children', () => {
  const result = t(`<Component foo={id}><div></div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    $$_create_component(Component, {
      foo: id,
      get children() {
        return $$_next_template($$_templ);
      },
    })"
  `);
});

it('should forward single call expression', () => {
  const result = t(`<Component>{() => <div>{id()}</div>}</Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    $$_create_component(Component, {
      get children() {
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
      get children() {
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

it('should compile component child fragment', () => {
  const result = t(
    `
<Component>
  <>
  <div id="foo">{id()}</div>
  <div id="bar">{id()}</div>
  </>
</Component>
`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"foo\\"><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"bar\\"><!$></div>\`);

    $$_create_component(Component, {
      get children() {
        return [
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })(),
          (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ_2),
              $$_expr = $$_walker.nextNode();

            $$_insert_at_marker($$_expr, id);

            return $$_root;
          })(),
        ];
      },
    })
    "
  `);
});

it('should insert multiple child components', () => {
  const result = t(`
<div>
  <Component />
  <Component />
  <div>Foo</div>
  <Component />
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$><!$><div>Foo</div><!$></div>\`);

    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_comp = $$_walker.nextNode(),
        $$_comp_2 = $$_walker.nextNode(),
        $$_comp_3 = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));
      $$_insert_at_marker($$_comp_2, $$_create_component(Component));
      $$_insert_at_marker($$_comp_3, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});

it('should insert fragmented child components', () => {
  const result = t(`
<div>
  <>
    <Component />
    <Component />
    <div>Foo</div>
    <Component />
  </>
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$><!$><div>Foo</div><!$></div>\`);

    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_comp = $$_walker.nextNode(),
        $$_comp_2 = $$_walker.nextNode(),
        $$_comp_3 = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));
      $$_insert_at_marker($$_comp_2, $$_create_component(Component));
      $$_insert_at_marker($$_comp_3, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});
