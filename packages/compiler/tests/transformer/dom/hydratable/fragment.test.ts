import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"></div>\`);
    [$$_next_template($$_templ), $$_next_template($$_templ_2)]"
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

it('should compile fragment with jsx expressions', () => {
  const result = t(
    `<><div id="a"></div>{false && <div>Ignore</div>}<div>B</div>{$id()}{$id() + 2}</>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template, $$_next_expression } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div>Ignore</div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<!$><div>B</div>\`);
    [
      $$_next_template($$_templ),
      false && $$_next_template($$_templ_2),
      $$_next_template($$_templ_3),
      $$_next_expression($id),
      $$_next_expression(() => $id() + 2),
    ]"
  `);
});
