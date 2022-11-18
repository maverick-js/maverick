import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {});

      return $$_root;
    })()"
  `);
});

it('should compile multiple $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} $on:foo={(e) =>{}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {});
      $$_listen($$_root, \\"foo\\", (e) => {});

      return $$_root;
    })()"
  `);
});

it('should compile $oncapture expression', () => {
  const result = t(`<div $oncapture:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {}, 1 /* CAPTURE */);

      return $$_root;
    })()"
  `);
});

it('should compile native $on expression', () => {
  const result = t(`<div $on:click={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_listen($$_root, \\"click\\", (e) => {});

      return $$_root;
    })()"
  `);
});
