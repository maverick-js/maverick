import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component, {
      get $children() {
        return \\"foo 10 bar 20 baz\\";
      },
    })"
  `);
});

it('should compile component with element children', () => {
  const result = t(`<Component><div>Foo{id()}</div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo<!$>\\", \\"</div>\\"];
    $$_create_component(Component, {
      get $children() {
        return $$_ssr($$_templ, id);
      },
    })"
  `);
});

it('should compile component with props and children', () => {
  const result = t(`<Component foo={id}><div></div></Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_create_component(Component, {
      foo: id,
      get $children() {
        return $$_ssr($$_templ);
      },
    })"
  `);
});

it('should compile component child fragment', () => {
  const result = t(
    `
<Component>
  <>
  <div id="foo">{id()}</div>
  <div id="bar">{id()}</div>
  {id}
  <div></div>
  {id}
  </>
</Component>
`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"foo\\\\\\"><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"bar\\\\\\"><!$>\\", \\"</div>\\"],
      $$_templ_3 = /* #__PURE__ */ [\\"<!$><div></div>\\"];

    $$_create_component(Component, {
      get $children() {
        return [$$_ssr($$_templ, id), $$_ssr($$_templ_2, id), id, $$_ssr($$_templ_3), id];
      },
    })
    "
  `);
});

it('should insert multiple child components', () => {
  const result = t(`
<div>
  <Component />
  <Component />
  <div>Foo</div>
  <Component />
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"<!$>\\", \\"<div>Foo</div><!$>\\", \\"</div>\\"];

    $$_ssr($$_templ, $$_create_component(Component), $$_create_component(Component), $$_create_component(Component))"
  `);
});

it('should insert fragmented child components', () => {
  const result = t(`
<div>
  <>
    <Component />
    <Component />
    <div>Foo</div>
    <Component />
  </>
</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"<!$>\\", \\"<div>Foo</div><!$>\\", \\"</div>\\"];

    $$_ssr($$_templ, $$_create_component(Component), $$_create_component(Component), $$_create_component(Component))"
  `);
});
