import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/dom\\";
    $$_create_component(Component, {
      get $children() {
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
      get $children() {
        const $$_root = $$_clone($$_templ);

        $$_insert($$_root, id);

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
      get $children() {
        return $$_clone($$_templ);
      },
    })"
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
      get $children() {
        return [
          \\"Text\\",
          $$_clone($$_templ),
          $$_create_component(Foo),
          $$_create_component(Bar, {
            get $children() {
              return [$$_clone($$_templ_2), $$_create_component(Baz)];
            },
          }),
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
  <span>Foo</span>
  <Component />
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><span>Foo</span></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component), $$_el);
      $$_insert($$_root, $$_create_component(Component));

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
      get $children() {
        return (item, i) => (
          (() => {
            const $$_root = $$_clone($$_templ),
              $$_el = $$_root.firstChild;

            $$_insert($$_root, item, $$_el);
            $$_insert($$_root, i);

            return $$_root;
          })()
        );
      },
    })
      "
  `);
});
