import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { delegateEvents: true }).code;

it('should compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {});

      return $$_root;
    })()"
  `);
});

it('should compile multiple $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} $on:foo={(e) =>{}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {});
      $$_listen($$_root, \\"foo\\", (e) => {});

      return $$_root;
    })()"
  `);
});

it('should compile $oncapture expression', () => {
  const result = t(`<div $oncapture:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_listen, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_listen($$_root, \\"foo\\", (e) => {}, 1 /* CAPTURE */);

      return $$_root;
    })()"
  `);
});

it('should compile native $on expression', () => {
  const result = t(`<div $on:click={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template, $$_delegate_events } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.$$click = (e) => {};

      return $$_root;
    })()

    $$_delegate_events([\\"click\\"]);
    "
  `);
});

it('should compile delegated $on expression', () => {
  const result = t(`<div $on:click={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template, $$_delegate_events } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.$$click = (e) => {};

      return $$_root;
    })()

    $$_delegate_events([\\"click\\"]);
    "
  `);
});

it('should compile delegated $on expression with data', () => {
  const result = t(`<div $on:click={[(e) => {}, 100]} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_create_template, $$_delegate_events } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    (() => {
      const $$_root = $$_clone($$_templ);

      $$_root.$$click = (e) => {};
      $$_root.$$clickData = 100;

      return $$_root;
    })()

    $$_delegate_events([\\"click\\"]);
    "
  `);
});
