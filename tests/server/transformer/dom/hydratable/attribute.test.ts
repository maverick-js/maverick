import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

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
