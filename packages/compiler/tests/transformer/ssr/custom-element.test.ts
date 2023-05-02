import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile', () => {
  const result = t(`<v-foo />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr($$_templ, $$_custom_element(\\"v-foo\\"))"
  `);
});

it('should compile with attrs/props', () => {
  const result = t(`<v-foo foo={10} bar={20} $prop:foo={10} $prop:bar={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr($$_templ, $$_custom_element(\\"v-foo\\", { foo: 10, bar: id() }, [{ \\"foo\\": 10, \\"bar\\": 20 }]))"
  `);
});

it('should compile with children', () => {
  const result = t(`<v-foo><div>{id}</div><v-bar /></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_custom_element } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$>\\"],
      $$_templ_3 = /* #__PURE__ */ $$_templ_2;
    $$_ssr(
      $$_templ_3,
      $$_custom_element(\\"v-foo\\", {
        $children() {
          return [$$_ssr($$_templ, id), $$_ssr($$_templ_2, $$_custom_element(\\"v-bar\\"))];
        },
      }),
    )"
  `);
});

it('should compile child custom element', () => {
  const result = t(`<div><v-foo $prop:foo={10} /></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, $$_custom_element(\\"v-foo\\", { foo: 10 }))"
  `);
});

it('should compile with inner html', () => {
  const result = t(`<v-foo $prop:innerHTML="<div>Foo</div>"><div>Foo</div></v-foo>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_custom_element } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr(
      $$_templ_2,
      $$_custom_element(\\"v-foo\\", {
        innerHTML: \\"<div>Foo</div>\\",
        $children() {
          return $$_ssr($$_templ);
        },
      }),
    )"
  `);
});
