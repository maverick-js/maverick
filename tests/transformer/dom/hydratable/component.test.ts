import { transform } from 'src/transformer';

const t = (code: string) => transform(code, { dev: true, hydratable: true }).code;

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);

    function Component() {
      return id > 10 ? (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_el;
    })() : 20;
    }
      "
  `);
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with props', () => {
  const result = t(`<div><Component foo="a" bar={id()} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component, { foo: \\"a\\", bar: id }));

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with spread', () => {
  const result = t(`<div><Component {...props} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_merge_props, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component, props));

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with multiple spreads', () => {
  const result = t(`<div><Component {...props} {...propsTwo} {...propsThree} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_merge_props, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component, $$_merge_props(props, propsTwo, propsThree)));

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with props and spread', () => {
  const result = t(`<div><Component foo="..." bar={id() + 10} {...props} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_merge_props, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker(
        $$_comp,
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

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker(
        $$_comp,
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
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker(
        $$_comp,
        $$_create_component(Component, {
          get children() {
            return $$_clone($$_templ_2, 1 /* ELEMENT */);
          },
        }),
      );

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with props and children', () => {
  const result = t(`<div><Component foo={id}><div></div></Component></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker(
        $$_comp,
        $$_create_component(Component, {
          foo: id,
          get children() {
            return $$_clone($$_templ_2, 1 /* ELEMENT */);
          },
        }),
      );

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component containing expression', () => {
  const result = t(`<div><Component>{() => <div>{id()}</div>}</Component></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_next_element, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker(
        $$_comp,
        $$_create_component(Component, {
          get children() {
            return () =>
              (() => {
                const $$_root = $$_clone($$_templ_2),
                  $$_walker = $$_create_markers_walker($$_root),
                  $$_el = $$_next_element($$_walker),
                  $$_expr = $$_walker.nextNode();

                $$_insert_at_marker($$_expr, id);

                return $$_el;
              })();
          },
        }),
      );

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should compile child component with fragment children', () => {
  const result = t(
    `<div><Component><><div id="foo"></div><div id="bar"></div></></Component></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"foo\\"></div><div id=\\"bar\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode();

      $$_insert_at_marker(
        $$_comp,
        $$_create_component(Component, {
          get children() {
            return $$_clone($$_templ_2);
          },
        }),
      );

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should insert multiple child components', () => {
  const result = t(`
  <div>
    <Component />
    <Component />
    <div></div>
    <Component />
  </div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_insert_at_marker, $$_create_component, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$><!$><div></div><!$></div>\`);

      (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_comp = $$_walker.nextNode(),
        $$_comp_2 = $$_walker.nextNode(),
        $$_comp_3 = $$_walker.nextNode();

      $$_insert_at_marker($$_comp, $$_create_component(Component));
      $$_insert_at_marker($$_comp_2, $$_create_component(Component));
      $$_insert_at_marker($$_comp_3, $$_create_component(Component));

      return $$_root.firstElementChild;
    })()"
  `);
});

it('should return `$el` if first node is dynamic', () => {
  const result = t(`<div>{id()}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_el;
    })()"
  `);
});

it('should return `firstElementChild` if first node is _not_ dynamic', () => {
  const result = t(`<div><div>{id()}</div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><!$><div><!$></div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id);

      return $$_root.firstElementChild;
    })()"
  `);
});
