import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile shorthand boolean attribute', () => {
  const result = t(`<button disabled />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<button disabled=\\"\\"></button>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile static attributes', () => {
  const result = t(`<div class="foo bar" style="baz daz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div class=\\"foo bar\\" style=\\"baz daz\\"></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile static attribute (number)', () => {
  const result = t(`<div foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div foo=\\"10\\"></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile static attribute (boolean)', () => {
  const result = t(`<div foo={true} bar={false}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div foo=\\"true\\" bar=\\"false\\"></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile static attribute (template string)', () => {
  const result = t(`<div foo={\`bar-baz\`} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div foo=\\"bar-baz\\"></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile dynamic attribute', () => {
  const result = t(`<div foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_attr($$_root, \\"foo\\", id);

      return $$_root;
    })()"
  `);
});

it('should compile observable attribute', () => {
  const result = t(`<div foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_effect, $$_attr, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_effect(() => $$_attr($$_root, \\"foo\\", id()));

      return $$_root;
    })()"
  `);
});
