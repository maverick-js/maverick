import { transform } from '../../src/transformer';

it('should compile empty file', () => {
  const result = transform(``);
  expect(result.code).toMatchInlineSnapshot('""');
});

it('should compile single JSX node', () => {
  const result = transform(`<div></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile single self-closing JSX node', () => {
  const result = transform(`<div />`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile multiple JSX nodes', () => {
  const result = transform(`<div><span id="a"></span><span id="b"></span></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><span id=\\"a\\"></span><span id=\\"b\\"></span></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile fragment', () => {
  const result = transform(`<><div id="a"></div><div id="b"></div></>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div id=\\"a\\"></div><div id=\\"b\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile nested fragment', () => {
  const result = transform(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div id=\\"root\\"><div id=\\"a\\"></div><div id=\\"b\\"></div></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile static attributes', () => {
  const result = transform(`<div class="foo bar" style="baz daz"></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div class=\\"foo bar\\" style=\\"baz daz\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile static attribute (number)', () => {
  const result = transform(`<div foo={10}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div foo=\\"10\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile static attribute (boolean)', () => {
  const result = transform(`<div foo={true} bar={false}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div foo=\\"true\\" bar=\\"false\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile static attribute (template string)', () => {
  const result = transform(`<div foo={\`bar-baz\`} ></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_template, $$_element } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div foo=\\"bar-baz\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile spread', () => {
  const result = transform(`<div {...props} ></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_spread, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_spread($$_el, props);

      return $$_el;
    })()"
  `);
});

it('should compile SVG spread', () => {
  const result = transform(`<svg {...props}></svg>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_spread, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<svg></svg>\`, 1 /* SVG */);
    (() => {
      const $$_el = $$_element($$_templ, 1 /* SVG */);

      $$_spread($$_el, props);

      return $$_el;
    })()"
  `);
});

it('should compile dynamic attribute', () => {
  const result = transform(`<div foo={id}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_attr, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_attr($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable attribute', () => {
  const result = transform(`<div foo={id()}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_attr, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_attr($$_el, \\"foo\\", () => id());

      return $$_el;
    })()"
  `);
});

it('should compile $prop expression', () => {
  const result = transform(`<div $prop:fooBar="baz"></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_prop, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_prop($$_el, \\"fooBar\\", \\"baz\\");

      return $$_el;
    })()"
  `);
});

it('should compile dynamic $prop expression', () => {
  const result = transform(`<div $prop:foo={id}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_prop, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_prop($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable $prop expression', () => {
  const result = transform(`<div $prop:foo={id()}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_prop, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_prop($$_el, \\"foo\\", () => id());

      return $$_el;
    })()"
  `);
});

it('should compile $class expression', () => {
  const result = transform(`<div $class:foo={true}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_class, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_class($$_el, \\"foo\\", true);

      return $$_el;
    })()"
  `);
});

it('should compile observable $class expression', () => {
  const result = transform(`<div $class:foo={id()}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_class, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_class($$_el, \\"foo\\", () => id());

      return $$_el;
    })()"
  `);
});

it('should compile $style expression', () => {
  const result = transform(`<div $style:foo="bar"></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div style=\\"foo: bar\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = transform(`<div $style:foo={id}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_style, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_style($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should group multiple static $style expressions', () => {
  const result = transform(
    `<div style="foo: a; " $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_style, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div style=\\"foo: a;foo: b;bar: true\\"></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_style($$_el, \\"baz\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable $style expression', () => {
  const result = transform(`<div $style:foo={id()}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_style, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_style($$_el, \\"foo\\", () => id());

      return $$_el;
    })()"
  `);
});

it('should compile $cssvar expression', () => {
  const result = transform(`<div $cssvar:foo={10}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div style=\\"--foo: 10\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should group multiple static $cssvar expressions', () => {
  const result = transform(
    `<div style="pre: 10" $cssvar:foo={10} $cssvar:bar={'align-content'} $cssvar:baz={id}></div>`,
  );
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_cssvar, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div style=\\"pre: 10;--foo: 10;--bar: align-content\\"></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_cssvar($$_el, \\"baz\\", id);

      return $$_el;
    })()"
  `);
});

it('should group multiple static $style and $cssvar expressions', () => {
  const result = transform(
    `<div style="pre: 10" $style:baz={\`content\`} $style:boo={20} $cssvar:foo={10} $cssvar:bar={'align-content'}></div>`,
  );
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div style=\\"pre: 10;baz: content;boo: 20;--foo: 10;--bar: align-content\\"></div>\`);
    $$_element($$_templ)"
  `);
});

it('should compile dynamic $cssvar expression', () => {
  const result = transform(`<div $cssvar:foo={id}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_cssvar, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_cssvar($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable $cssvar expression', () => {
  const result = transform(`<div $cssvar:foo-bar={id()}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_cssvar, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_cssvar($$_el, \\"foo-bar\\", () => id());

      return $$_el;
    })()"
  `);
});

it('should compile $use expression', () => {
  const result = transform(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_directive, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_directive($$_el, directive, [1, 2, 3]);

      return $$_el;
    })()"
  `);
});

it('should compile $ref expression', () => {
  const result = transform(`<div $ref={(el) => {}}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_ref, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_ref($$_el, (el) => {});

      return $$_el;
    })()"
  `);
});

it('should compile $ref expression that uses array', () => {
  const result = transform(`<div $ref={[(el) => {}, (el) => {}]}></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_ref, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_ref($$_el, [(el) => {}, (el) => {}]);

      return $$_el;
    })()"
  `);
});

it('should compile $on expression', () => {
  const result = transform(`<div $on:foo={(e) => {}} />`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_listen, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_listen($$_el, \\"foo\\", (e) => {});

      return $$_el;
    })()"
  `);
});

it('should compile multiple $on expression', () => {
  const result = transform(`<div $on:foo={(e) => {}} $on:foo={(e) =>{}} />`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_listen, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_listen($$_el, \\"foo\\", (e) => {});
      $$_listen($$_el, \\"foo\\", (e) => {});

      return $$_el;
    })()"
  `);
});

it('should compile $oncapture expression', () => {
  const result = transform(`<div $oncapture:foo={(e) => {}} />`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_listen, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_listen($$_el, \\"foo\\", (e) => {}, 0, /* DELEGATE */ 1 /* CAPTURE */);

      return $$_el;
    })()"
  `);
});

it('should delegate event listener', () => {
  const result = transform(`<div $on:click={(e) => {}} />`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_listen, $$_template, $$_run_hydration_events, $$_delegate_events } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_listen($$_el, \\"click\\", (e) => {}, 1 /* DELEGATE */);

      $$_run_hydration_events();

      return $$_el;
    })()

    $$_delegate_events([\\"click\\"])"
  `);
});

it('should delegate event listener (capture)', () => {
  const result = transform(`<div $oncapture:click={(e) => {}} />`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_listen, $$_template, $$_run_hydration_events, $$_delegate_events } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ);

      $$_listen($$_el, \\"click\\", (e) => {}, 1, /* DELEGATE */ 1 /* CAPTURE */);

      $$_run_hydration_events();

      return $$_el;
    })()

    $$_delegate_events([\\"click\\"])"
  `);
});

it('should compile child expression', () => {
  const result = transform(`<div>{id}</div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_markers, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!X></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_expr = $$_mks[0];

      $$_insert($$_expr, id);

      return $$_el;
    })()"
  `);
});

it('should compile observable child expression', () => {
  const result = transform(`<div>{id()}</div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_markers, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!X></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_expr = $$_mks[0];

      $$_insert($$_expr, () => id());

      return $$_el;
    })()"
  `);
});

it('should compile conditional element expression ', () => {
  const result = transform(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_markers, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div id=\\"a\\"><!X></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_template(\`<div id=\\"b\\"></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_expr = $$_mks[0];

      $$_insert($$_expr, id > 10 && $$_element($$_templ_2));

      return $$_el;
    })()"
  `);
});

it('should compile child component', () => {
  const result = transform(`<div><Component /></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_markers, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert($$_comp, $$_component(Component));

      return $$_el;
    })()"
  `);
});

it('should compile child component with props', () => {
  const result = transform(`<div><Component foo="a" bar={id()} /></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_markers, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert(
        $$_comp,
        $$_component(Component, {
          foo: \\"a\\",
          get bar() {
            return id();
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component with spread', () => {
  const result = transform(`<div><Component {...props} /></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_markers, $$_merge_props, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert($$_comp, $$_component(Component, props));

      return $$_el;
    })()"
  `);
});

it('should compile child component with multiple spreads', () => {
  const result = transform(`<div><Component {...props} {...propsTwo} {...propsThree} /></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_markers, $$_merge_props, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert($$_comp, $$_component(Component, $$_merge_props(props, propsTwo, propsThree)));

      return $$_el;
    })()"
  `);
});

it('should compile child component with props and spread', () => {
  const result = transform(`<div><Component foo="..." bar={id()} {...props} /></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_markers, $$_merge_props, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert(
        $$_comp,
        $$_component(
          Component,
          $$_merge_props(props, {
            foo: \\"...\\",
            get bar() {
              return id();
            },
          }),
        ),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component with children', () => {
  const result = transform(`<div><Component><div></div></Component></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_template, $$_markers } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert(
        $$_comp,
        $$_component(Component, {
          get children() {
            return $$_element($$_templ_2);
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component with props and children', () => {
  const result = transform(`<div><Component foo={id}><div></div></Component></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_template, $$_markers } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_template(\`<div></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert(
        $$_comp,
        $$_component(Component, {
          foo: id,
          get children() {
            return $$_element($$_templ_2);
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should compile child component containing expression', () => {
  const result = transform(`<div><Component>{id()}</Component></div>`);
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_markers, $$_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_template(\`<!X>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert(
        $$_comp,
        $$_component(Component, {
          get children() {
            return (() => {
              const $$_mks = $$_markers(),
                $$_expr = $$_mks[0];

              $$_insert($$_expr, () => id());

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
  const result = transform(
    `<div><Component><><div id="foo"></div><div id="bar"></div></></Component></div>`,
  );
  expect(result.code).toMatchInlineSnapshot(`
    "import { $$_element, $$_insert, $$_component, $$_template, $$_markers } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_template(\`<div><!C></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_template(\`<div id=\\"foo\\"></div><div id=\\"bar\\"></div>\`);
    (() => {
      const $$_el = $$_element($$_templ),
        $$_mks = $$_markers($$_el),
        $$_comp = $$_mks[0];

      $$_insert(
        $$_comp,
        $$_component(Component, {
          get children() {
            return $$_element($$_templ_2);
          },
        }),
      );

      return $$_el;
    })()"
  `);
});

it('should return sourcemap', () => {
  const result = transform(`<div></div>`, { filename: 'foo.tsx', sourcemap: true });
  expect(result.map).toBeDefined();
  expect(result.map!.sources[0]).toBe('foo.tsx');
});
