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
