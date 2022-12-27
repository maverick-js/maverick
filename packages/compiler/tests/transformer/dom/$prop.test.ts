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
    "import { $$_clone, $$_effect, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_effect(() => $$_attr($$_root, \\"foo\\", props.id));

      return $$_root;
    })()"
  `);
});
