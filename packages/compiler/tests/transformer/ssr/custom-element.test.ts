import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile', () => {
  const result = t(`<v-foo />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><v-foo\\", \\"\\", \\"</v-foo>\\"];
    $$_ssr($$_templ, ...$$_custom_element(\\"v-foo\\"))"
  `);
});

it('should compile with attrs/props', () => {
  const result = t(`<v-foo foo={10} bar={20} $prop:foo={10} $prop:bar={id()} $class:foo={true} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><v-foo\\", \\"\\", \\"</v-foo>\\"];
    $$_ssr(
      $$_templ,
      ...$$_custom_element(\\"v-foo\\", { foo: 10, bar: id() }, [{ \\"foo\\": 10, \\"bar\\": 20, \\"$$class\\": { \\"foo\\": true } }]),
    )"
  `);
});

it('should compile with children', () => {
  const result = t(`<v-foo><div>{id}</div><v-bar /></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><v-foo\\", \\"\\", \\"<div><!$>\\", \\"</div><!$><v-bar\\", \\"\\", \\"</v-bar></v-foo>\\"];
    $$_ssr($$_templ, ...$$_custom_element(\\"v-foo\\", { $children: () => [id, ...$$_custom_element(\\"v-bar\\")] }))"
  `);
});

it('should compile child custom element', () => {
  const result = t(`<div><v-foo $prop:foo={10} /></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$><v-foo\\", \\"\\", \\"</v-foo></div>\\"];
    $$_ssr($$_templ, ...$$_custom_element(\\"v-foo\\", { foo: 10 }))"
  `);
});

it('should compile with inner html', () => {
  const result = t(`<v-foo $prop:innerHTML={id()}><div>Foo</div></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><v-foo\\", \\"\\", \\"</v-foo>\\"];
    $$_ssr($$_templ, ...$$_custom_element(\\"v-foo\\", { innerHTML: id() }))"
  `);
});
