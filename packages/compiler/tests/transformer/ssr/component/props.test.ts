import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={10} boo={true} baz={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component, { foo: \\"a\\", bar: 10, boo: true, baz: id() })"
  `);
});

it('should compile jsx prop expression', () => {
  const result = t(`<Component foo={<div>Foo</div>} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"];
    $$_create_component(Component, { foo: $$_ssr($$_templ) })"
  `);
});

it('should compile child jsx prop expression', () => {
  const result = t(`<Component foo={id > 10 ? <div>Foo</div> : null} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"];
    $$_create_component(Component, { foo: id > 10 ? $$_ssr($$_templ) : null })"
  `);
});

it('should compile dynamic jsx prop expression', () => {
  const result = t(`<Component foo={<div id={id()}>Foo</div>} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\">Foo</div>\\"];
    $$_create_component(Component, { foo: $$_ssr($$_templ, $$_attr(\\"id\\", id)) })"
  `);
});

it('should compile multiple jsx prop expressions', () => {
  const result = t(`<Component foo={id > 10 ? <div id={id()}>Foo</div> : <div>Bar</div>} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\">Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div>Bar</div>\\"];
    $$_create_component(Component, { foo: id > 10 ? $$_ssr($$_templ, $$_attr(\\"id\\", id)) : $$_ssr($$_templ_2) })"
  `);
});
