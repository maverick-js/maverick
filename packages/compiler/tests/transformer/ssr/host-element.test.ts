import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile empty', () => {
  const result = t(`<HostElement />`);
  expect(result).toMatchInlineSnapshot('"null"');
});

it('should compile attribute', () => {
  const result = t(`<HostElement foo={id} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ, $$_host_element([{ \\"foo\\": id }]))"
  `);
});

it('should compile $prop', () => {
  const result = t(`<HostElement $prop:foo="1" />`);
  expect(result).toMatchInlineSnapshot('"null"');
});

it('should compile $class', () => {
  const result = t(`<HostElement $class:foo="..." />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ, $$_host_element([{ \\"$$class\\": { \\"foo\\": \\"...\\" } }]))"
  `);
});

it('should compile $style', () => {
  const result = t(`<HostElement $style:foo="..." />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ, $$_host_element([{ \\"$$style\\": { \\"foo\\": \\"...\\" } }]))"
  `);
});

it('should compile $cssvar', () => {
  const result = t(`<HostElement $cssvar:foo="..." />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ, $$_host_element([{ \\"$$style\\": { \\"--foo\\": \\"...\\" } }]))"
  `);
});

it('should compile $on', () => {
  const result = t(`<HostElement $on:foo={handler} />`);
  expect(result).toMatchInlineSnapshot('"null"');
});

it('should compile $ref', () => {
  const result = t(`<HostElement $ref={handler} />`);
  expect(result).toMatchInlineSnapshot('"null"');
});

it('should compile $use', () => {
  const result = t(`<HostElement $use:foo={[arg1, arg2]} />`);
  expect(result).toMatchInlineSnapshot('"null"');
});

it('should compile with children', () => {
  const result = t(`<HostElement><div>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div>Bar</div>\\"];
    [$$_ssr($$_templ), $$_ssr($$_templ_2)]"
  `);
});

it('should compile with dynamic child', () => {
  const result = t(`<HostElement><div foo={id}>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\">Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div>Bar</div>\\"];
    [$$_ssr($$_templ, $$_attr(\\"foo\\", id)), $$_ssr($$_templ_2)]"
  `);
});

it('should compile with attrs and children', () => {
  const result = t(`<HostElement foo={id}><div>Foo</div><div>Bar</div></HostElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_host_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div>Bar</div>\\"],
      $$_templ_3 = /* #__PURE__ */ [\\"\\", \\"\\"];
    $$_ssr($$_templ_3, $$_host_element([{ \\"foo\\": id }]), [$$_ssr($$_templ), $$_ssr($$_templ_2)])"
  `);
});
