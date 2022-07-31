import { transform } from 'src/transformer';

const t = (code: string) => transform(code, { dev: true, hydratable: true }).code;

it('should compile empty file', () => {
  const result = t(``);
  expect(result).toMatchInlineSnapshot('""');
});

it('should compile single JSX node', () => {
  const result = t(`<div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile single self-closing JSX node', () => {
  const result = t(`<div />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile multiple JSX nodes', () => {
  const result = t(`<div><span id="a"></span><span id="b"></span></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><span id=\\"a\\"></span><span id=\\"b\\"></span></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div><div id=\\"b\\"></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile nested fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"root\\"><div id=\\"a\\"></div><div id=\\"b\\"></div></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile static attributes', () => {
  const result = t(`<div class="foo bar" style="baz daz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div class=\\"foo bar\\" style=\\"baz daz\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile static attribute (number)', () => {
  const result = t(`<div foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div foo=\\"10\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile static attribute (boolean)', () => {
  const result = t(`<div foo={true} bar={false}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div foo=\\"true\\" bar=\\"false\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile static attribute (template string)', () => {
  const result = t(`<div foo={\`bar-baz\`} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div foo=\\"bar-baz\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile spread', () => {
  const result = t(`<div {...props} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_spread, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_spread($$_el, props);

      return $$_el;
    })()"
  `);
});

it('should compile SVG spread', () => {
  const result = t(`<svg {...props}></svg>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_spread, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><svg></svg>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_spread($$_el, props);

      return $$_el;
    })()"
  `);
});

it('should compile dynamic attribute', () => {
  const result = t(`<div foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_attr, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_attr($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable attribute', () => {
  const result = t(`<div foo={id() + 10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_attr, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_attr($$_el, \\"foo\\", () => id() + 10);

      return $$_el;
    })()"
  `);
});

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_inner_html, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_inner_html($$_el, \\"baz\\");

      return $$_el;
    })()"
  `);
});

it('should compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_prop, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_prop($$_el, \\"fooBar\\", \\"baz\\");

      return $$_el;
    })()"
  `);
});

it('should compile dynamic $prop expression', () => {
  const result = t(`<div $prop:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_prop, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_prop($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable $prop expression', () => {
  const result = t(`<div $prop:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_prop, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_prop($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_class, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_class($$_el, \\"foo\\", true);

      return $$_el;
    })()"
  `);
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_class, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_class($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div style=\\"foo: bar\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_style, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_style($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should group multiple static $style expressions', () => {
  const result = t(
    `<div style="foo: a; " $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_style, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"foo: a;foo: b;bar: true\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_style($$_el, \\"baz\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable $style expression', () => {
  const result = t(`<div $style:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_style, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_style($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div style=\\"--foo: 10\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should group multiple static $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $cssvar:foo={10} $cssvar:bar={'align-content'} $cssvar:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_cssvar, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div style=\\"pre: 10;--foo: 10;--bar: align-content\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_cssvar($$_el, \\"baz\\", id);

      return $$_el;
    })()"
  `);
});

it('should group multiple static $style and $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $style:baz={\`content\`} $style:boo={20} $cssvar:foo={10} $cssvar:bar={'align-content'}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div style=\\"pre: 10;baz: content;boo: 20;--foo: 10;--bar: align-content\\"></div>\`);
    $$_clone($$_templ, 1 /* ELEMENT */)"
  `);
});

it('should compile dynamic $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_cssvar, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_cssvar($$_el, \\"foo\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile observable $cssvar expression', () => {
  const result = t(`<div $cssvar:foo-bar={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_cssvar, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_cssvar($$_el, \\"foo-bar\\", id);

      return $$_el;
    })()"
  `);
});

it('should compile $use expression', () => {
  const result = t(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_directive, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_directive($$_el, directive, [1, 2, 3]);

      return $$_el;
    })()"
  `);
});

it('should compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_ref, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_ref($$_el, (el) => {});

      return $$_el;
    })()"
  `);
});

it('should compile $ref expression that uses array', () => {
  const result = t(`<div $ref={[(el) => {}, (el) => {}]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_ref, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_ref($$_el, [(el) => {}, (el) => {}]);

      return $$_el;
    })()"
  `);
});

it('should compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_listen, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_listen($$_el, \\"foo\\", (e) => {});

      return $$_el;
    })()"
  `);
});

it('should compile multiple $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} $on:foo={(e) =>{}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_listen, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_listen($$_el, \\"foo\\", (e) => {});
      $$_listen($$_el, \\"foo\\", (e) => {});

      return $$_el;
    })()"
  `);
});

it('should compile $on_capture expression', () => {
  const result = t(`<div $on_capture:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_listen, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_listen($$_el, \\"foo\\", (e) => {}, 1 /* CAPTURE */);

      return $$_el;
    })()"
  `);
});

it('should compile native $on expression', () => {
  const result = t(`<div $on:click={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_listen, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker);

      $$_listen($$_el, \\"click\\", (e) => {});

      return $$_el;
    })()"
  `);
});

it('should compile child expression', () => {
  const result = t(`<div>{id}</div>`);
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

it('should compile observable child expression', () => {
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

it('should compile conditional element expression ', () => {
  const result = t(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"b\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, id > 10 && $$_clone($$_templ_2, 1 /* ELEMENT */));

      return $$_el;
    })()"
  `);
});

it('should compile observable conditional element expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id()}></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_markers_walker, $$_next_element, $$_listen, $$_create_template } from \\"@maverick-js/elements/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"><!$></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ),
        $$_walker = $$_create_markers_walker($$_root),
        $$_el = $$_next_element($$_walker),
        $$_expr = $$_walker.nextNode();

      $$_insert_at_marker($$_expr, () =>
        id() > 10 && (() => {
          const $$_root = $$_clone($$_templ_2),
            $$_walker = $$_create_markers_walker($$_root),
            $$_el = $$_next_element($$_walker);

          $$_listen($$_el, \\"click\\", id());

          return $$_el;
        })());

      return $$_el;
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

it('should return `firstElementChild` if first node is not dynamic', () => {
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
