import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"b\\"></div>\`);
    [$$_clone($$_templ), $$_clone($$_templ_2)]"
  `);
});

it('should compile child fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"root\\"><div id=\\"a\\"></div><div id=\\"b\\"></div></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile fragment with jsx expressions', () => {
  const result = t(`<><div id="a"></div>{false && <div>Ignore</div>}<div>B</div>{$id()}</>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div>Ignore</div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<div>B</div>\`);
    [$$_clone($$_templ), false && $$_clone($$_templ_2), $$_clone($$_templ_3), $id()]"
  `);
});
