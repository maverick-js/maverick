import { transform } from 'src/transformer';

const t = (code: string) => transform(code, { dev: true }).code;

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);

    function Component() {
      return id > 10 ? (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_el, id);

      return $$_el;
    })() : 20;
    }
      "
  `);
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_el, $$_create_component(Component));

      return $$_el;
    })()"
  `);
});

it('should compile child component with props', () => {
  const result = t(`<div><Component foo="a" bar={id()} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_el, $$_create_component(Component, { foo: \\"a\\", bar: id }));

      return $$_el;
    })()"
  `);
});

it('should compile child component with spread', () => {
  const result = t(`<div><Component {...props} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_merge_props, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_el, $$_create_component(Component, props));

      return $$_el;
    })()"
  `);
});

it('should compile child component with multiple spreads', () => {
  const result = t(`<div><Component {...props} {...propsTwo} {...propsThree} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_merge_props, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert($$_el, $$_create_component(Component, $$_merge_props(props, propsTwo, propsThree)));

      return $$_el;
    })()"
  `);
});

it('should compile child component with props and spread', () => {
  const result = t(`<div><Component foo="..." bar={id() + 10} {...props} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_merge_props, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert(
        $$_el,
        $$_create_component(
          Component,
          $$_merge_props(props, {
            foo: \\"...\\",
            get bar() {
              return id() + 10;
            },
          }),
        ),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ ;
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_insert(
        $$_root,
        $$_create_component(Component, {
          get children() {
            return \\"foo 10 bar 20 baz\\";
          },
        }),
      );

      return $$_root;
    })()"
  `);
});

it('should compile child component with element children', () => {
  const result = t(`<div><Component><div></div></Component></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert(
        $$_el,
        $$_create_component(Component, {
          get children() {
            return $$_clone($$_templ_2, 1 /* ELEMENT */);
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component with props and children', () => {
  const result = t(`<div><Component foo={id}><div></div></Component></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert(
        $$_el,
        $$_create_component(Component, {
          foo: id,
          get children() {
            return $$_clone($$_templ_2, 1 /* ELEMENT */);
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component containing expression', () => {
  const result = t(`<div><Component>{() => <div>{id()}</div>}</Component></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert(
        $$_el,
        $$_create_component(Component, {
          get children() {
            return () =>
              (() => {
                const $$_root = $$_clone($$_templ_2),
                  $$_el = $$_root.firstChild;

                $$_insert($$_el, id);

                return $$_el;
              })();
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component with fragment children', () => {
  const result = t(
    `<div><Component><><div id="foo"></div><div id="bar"></div></></Component></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_insert_at_marker, $$_create_component, $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"foo\\"></div><div id=\\"bar\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild;

      $$_insert(
        $$_el,
        $$_create_component(Component, {
          get children() {
            return $$_clone($$_templ_2);
          },
        }),
      );

      return $$_el;
    })()"
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
    "import { $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.firstChild;

      $$_insert($$_el, $$_create_component(Component), $$_el_2);
      $$_insert($$_el, $$_create_component(Component), $$_el_2);
      $$_insert($$_el, $$_create_component(Component), null);

      return $$_el;
    })()"
  `);
});

it('should insert multiple fragmented child components', () => {
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
    "import { $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div>Foo</div></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.firstChild;

      $$_insert($$_el, $$_create_component(Component), $$_el_2);
      $$_insert($$_el, $$_create_component(Component), $$_el_2);
      $$_insert($$_el, $$_create_component(Component), null);

      return $$_el;
    })()"
  `);
});
