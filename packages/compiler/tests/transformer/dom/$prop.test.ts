import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"><div>Foo</div><div>Bar</div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_inner_html, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_inner_html($$_root, \\"baz\\");

      return $$_root;
    })()"
  `);
});

it('should compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.fooBar = \\"baz\\";

      return $$_root;
    })()"
  `);
});

it('should compile shorthand $prop boolean', () => {
  const result = t(`<button $prop:disabled />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<button></button>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.disabled = true;

      return $$_root;
    })()"
  `);
});

it('should compile dynamic $prop expression', () => {
  const result = t(`<div $prop:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.foo = id;

      return $$_root;
    })()"
  `);
});

it('should compile observable $prop expression', () => {
  const result = t(`<div $prop:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_effect, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_effect(() => void ($$_root.foo = id()));

      return $$_root;
    })()"
  `);
});

it('should compile property access expression', () => {
  const result = t(`<div foo={props.id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_attr($$_root, \\"foo\\", props.id);

      return $$_root;
    })()"
  `);
});

it('should group DOM effects if flag is set', () => {
  const result = transform(
    `
<div class={foo() ? 'foo': ''}>
  <div $on:click={[select, id]} $prop:textContent={bar()} />
  <div aria-hidden={baz()} />
  <div $class:foo={bux()} />
  <div $style:bar={hux()} />
  <div $cssvar:baz={qux()} />
</div>
`,
    { groupDOMEffects: true },
  ).code;

  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_attr, $$_listen, $$_class, $$_style, $$_create_template, $$_effect } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div> </div><div></div><div></div><div></div><div></div></div>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.firstChild,
        $$_el_3 = $$_el.nextSibling,
        $$_el_4 = $$_el_3.nextSibling,
        $$_el_5 = $$_el_4.nextSibling,
        $$_el_6 = $$_el_5.nextSibling;

      $$_listen($$_el, \\"click\\", select);
      $$_effect(() => {
        $$_attr($$_root, \\"class\\", foo() ? \\"foo\\" : \\"\\");
        $$_el_2.data = bar();
        $$_attr($$_el_3, \\"aria-hidden\\", baz());
        $$_class($$_el_4, \\"foo\\", bux());
        $$_style($$_el_5, \\"bar\\", hux());
        $$_style($$_el_6, \\"--baz\\", qux());
      });

      return $$_root;
    })()
    "
  `);
});
