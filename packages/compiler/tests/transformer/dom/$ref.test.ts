import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_ref, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_ref($$_root, (el) => {});

      return $$_root;
    })()"
  `);
});

it('should compile $ref expression that uses array', () => {
  const result = t(`<div $ref={[(el) => {}, (el) => {}]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_ref, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_ref($$_root, [(el) => {}, (el) => {}]);

      return $$_root;
    })()"
  `);
});
