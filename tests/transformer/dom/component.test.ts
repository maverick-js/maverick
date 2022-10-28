import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

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
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, $$_create_component(Component));

      return $$_root;
    })()"
  `);
});

it('should compile nested components', () => {
  const result = t(`
<Component>
  Text
  <div>
    <span>Text</span>
  </div>
  <Foo />
  <Bar>
    <div></div>
    <Baz />
  </Bar>
</Component>
`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><span>Text</span></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);

    $$_create_component(Component, {
      get children() {
        return [
          \\"Text\\",
          $$_clone($$_templ),
          $$_create_component(Foo),
          $$_create_component(Bar, {
            get children() {
              return [$$_clone($$_templ_2), $$_create_component(Baz)];
            },
          }),
        ];
      },
    })
    "
  `);
});

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);

    function Component() {
      return id > 10 ? (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert($$_root, id);

      return $$_root;
    })() : 20;
    }
      "
  `);
});

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={10} boo={true} baz={id()} qux />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, { foo: \\"a\\", bar: 10, boo: true, baz: id, qux: true })"
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
  const result = t(`<Component foo="..." bar={id() + 10} {...props} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/dom\\";
    $$_create_component(
      Component,
      $$_merge_props(props, {
        foo: \\"...\\",
        get bar() {
          return id() + 10;
        },
      }),
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
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div>Foo</div>\`);
    $$_create_component(Component, {
      get children() {
        const $$_root = $$_clone($$_templ);

        $$_insert($$_root, id, null);

        return $$_root;
      },
    })"
  `);
});

it('should compile component with props and children', () => {
  const result = t(`<Component foo={id}><div></div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_create_component(Component, {
      foo: id,
      get children() {
        return $$_clone($$_templ);
      },
    })"
  `);
});

it('should forward single call expression', () => {
  const result = t(`<Component>{() => <div>{id()}</div>}</Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_create_component(Component, {
      get children() {
        return () =>
          (() => {
            const $$_root = $$_clone($$_templ);

            $$_insert($$_root, id);

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
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_templ;

    $$_create_component(Component, {
      get children() {
        return [() =>
          (() => {
            const $$_root = $$_clone($$_templ);

            $$_insert($$_root, id);

            return $$_root;
          })(), () =>
          (() => {
            const $$_root = $$_clone($$_templ_2);

            $$_insert($$_root, id);

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
  {id}
  <div></div>
  {id}
  </>
</Component>
`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"foo\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"bar\\"></div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);

    $$_create_component(Component, {
      get children() {
        return [
          (() => {
            const $$_root = $$_clone($$_templ);

            $$_insert($$_root, id);

            return $$_root;
          })(),
          (() => {
            const $$_root = $$_clone($$_templ_2);

            $$_insert($$_root, id);

            return $$_root;
          })(),
          id,
          $$_clone($$_templ_3),
          id,
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
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component), null);

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
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component), null);

      return $$_root;
    })()"
  `);
});

it('should compile for loop', () => {
  const result = t(`
  <For each={source}>
    {(item, i) => (
      <span>
        {item()} - {i}
      </span>
    )}
  </For>
  `);

  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_template, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<span>- </span>\`);

      $$_create_component(For, {
      each: source,
      get children() {
        return (item, i) => (
          (() => {
            const $$_root = $$_clone($$_templ),
              $$_el = $$_root.firstChild;

            $$_insert($$_root, item, $$_el);
            $$_insert($$_root, i, null);

            return $$_root;
          })()
        );
      },
    })
      "
  `);
});
