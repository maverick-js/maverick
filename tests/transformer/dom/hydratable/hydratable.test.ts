import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile empty file', () => {
  const result = t(``);
  expect(result).toMatchInlineSnapshot('""');
});

it('should compile single JSX node', () => {
  const result = t(`<div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile single self-closing JSX node', () => {
  const result = t(`<div />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile multiple JSX nodes', () => {
  const result = t(`<div><span id="a"></span><span id="b"></span></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><span id=\\"a\\"></span><span id=\\"b\\"></span></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"></div>\`);
    [$$_next_template($$_templ), $$_next_template($$_templ_2)]"
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

it('should compile child fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"root\\"><div id=\\"a\\"></div><div id=\\"b\\"></div></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile custom element', () => {
  const result = t(`<CustomElement $element={DEFINITION} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_next_custom_element, $$_setup_custom_element } from \\"maverick.js/dom\\";
    (() => {
      const $$_el = $$_next_custom_element(DEFINITION);

      $$_setup_custom_element($$_el, DEFINITION);

      return $$_el;
    })()"
  `);
});

it('should compile custom element with children', () => {
  const result = t(`<CustomElement $element={DEFINITION}><div>{id}</div></CustomElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_next_custom_element, $$_create_walker, $$_clone, $$_insert_at_marker, $$_create_template, $$_setup_custom_element } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><!$></div>\`);
    (() => {
      const $$_el = $$_next_custom_element(DEFINITION);

      $$_setup_custom_element($$_el, DEFINITION, {
        get $children() {
          const [$$_root, $$_walker] = $$_create_walker($$_templ),
            $$_expr = $$_walker.nextNode();

          $$_insert_at_marker($$_expr, id);

          return $$_root;
        },
      });

      return $$_el;
    })()"
  `);
});

it('should compile child custom element', () => {
  const result = t(
    `<div><div>Foo</div><CustomElement $prop:foo={props.foo} $element={DEFINITION}>{id()}</CustomElement><div>Bar</div></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_next_custom_element, $$_setup_custom_element, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div><div>Foo</div><!$><div>Bar</div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ),
        $$_el = $$_next_custom_element(DEFINITION, $$_walker);

      $$_setup_custom_element($$_el, DEFINITION, {
        get foo() {
          return props.foo;
        },
        get $children() {
          return id();
        },
      });

      return $$_root;
    })()"
  `);
});

it('should compile static attributes', () => {
  const result = t(`<div class="foo bar" style="baz daz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div class=\\"foo bar\\" style=\\"baz daz\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile static attribute (number)', () => {
  const result = t(`<div foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div foo=\\"10\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile static attribute (boolean)', () => {
  const result = t(`<div foo={true} bar={false}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div foo=\\"true\\" bar=\\"false\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile static attribute (template string)', () => {
  const result = t(`<div foo={\`bar-baz\`} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div foo=\\"bar-baz\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile spread', () => {
  const result = t(`<div {...props} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_spread, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_spread($$_root, props);

      return $$_root;
    })()"
  `);
});

it('should compile SVG spread', () => {
  const result = t(`<svg {...props}></svg>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_spread, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><svg></svg>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_spread($$_root, props);

      return $$_root;
    })()"
  `);
});

it('should compile dynamic attribute', () => {
  const result = t(`<div foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_attr($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable attribute', () => {
  const result = t(`<div foo={id() + 10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_attr($$_root, \\"foo\\", () => id() + 10);

      return $$_root;
    })()"
  `);
});

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_inner_html, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_inner_html($$_root, \\"baz\\");

      return $$_root;
    })()"
  `);
});

it('should compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_prop, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_prop($$_root, \\"fooBar\\", \\"baz\\");

      return $$_root;
    })()"
  `);
});

it('should compile dynamic $prop expression', () => {
  const result = t(`<div $prop:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_prop, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_prop($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable $prop expression', () => {
  const result = t(`<div $prop:foo={id()} $prop:bar={props.id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_prop, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_prop($$_root, \\"foo\\", id);
      $$_prop($$_root, \\"bar\\", () => props.id);

      return $$_root;
    })()"
  `);
});

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_class, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_class($$_root, \\"foo\\", true);

      return $$_root;
    })()"
  `);
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()} $class:bar={props.id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_class, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_class($$_root, \\"foo\\", id);
      $$_class($$_root, \\"bar\\", () => props.id);

      return $$_root;
    })()"
  `);
});

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"foo: bar\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_style($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should group multiple static $style expressions', () => {
  const result = t(
    `<div style="foo: a; " $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"foo: a;foo: b;bar: true\\"></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_style($$_root, \\"baz\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable $style expression', () => {
  const result = t(`<div $style:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_style, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_style($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"--foo: 10\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should group multiple static $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $cssvar:foo={10} $cssvar:bar={'align-content'} $cssvar:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_cssvar, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"pre: 10;--foo: 10;--bar: align-content\\"></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_cssvar($$_root, \\"baz\\", id);

      return $$_root;
    })()"
  `);
});

it('should group multiple static $style and $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $style:baz={\`content\`} $style:boo={20} $cssvar:foo={10} $cssvar:bar={'align-content'}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"pre: 10;baz: content;boo: 20;--foo: 10;--bar: align-content\\"></div>\`);
    $$_next_template($$_templ)"
  `);
});

it('should compile dynamic $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_cssvar, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_cssvar($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable $cssvar expression', () => {
  const result = t(`<div $cssvar:foo-bar={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_cssvar, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_cssvar($$_root, \\"foo-bar\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile $use expression', () => {
  const result = t(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_directive, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_directive($$_root, directive, [1, 2, 3]);

      return $$_root;
    })()"
  `);
});

it('should compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_ref, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_ref($$_root, (el) => {});

      return $$_root;
    })()"
  `);
});

it('should compile $ref expression that uses array', () => {
  const result = t(`<div $ref={[(el) => {}, (el) => {}]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_ref, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_ref($$_root, [(el) => {}, (el) => {}]);

      return $$_root;
    })()"
  `);
});

it('should compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {});

      return $$_root;
    })()"
  `);
});

it('should compile multiple $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} $on:foo={(e) =>{}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {});
      $$_listen($$_root, \\"foo\\", (e) => {});

      return $$_root;
    })()"
  `);
});

it('should compile $oncapture expression', () => {
  const result = t(`<div $oncapture:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {}, 1 /* CAPTURE */);

      return $$_root;
    })()"
  `);
});

it('should compile native $on expression', () => {
  const result = t(`<div $on:click={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"click\\", (e) => {});

      return $$_root;
    })()"
  `);
});

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
