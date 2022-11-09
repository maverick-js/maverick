import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

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
