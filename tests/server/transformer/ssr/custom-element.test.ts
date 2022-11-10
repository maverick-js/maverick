import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('shoud compile', () => {
  const result = t(`<CustomElement $element={DEFINITION} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr($$_templ, $$_custom_element(DEFINITION))"
  `);
});

it('shoud compile with attrs/props', () => {
  const result = t(
    `<CustomElement foo={10} bar={20} $prop:foo={10} $prop:bar={id()} $element={DEFINITION} />`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr($$_templ, $$_custom_element(DEFINITION, { foo: 10, bar: id }, [{ \\"foo\\": 10, \\"bar\\": 20 }]))"
  `);
});

it('shoud compile with children', () => {
  const result = t(`<CustomElement $element={DEFINITION}><div>{id}</div></CustomElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_custom_element } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr(
      $$_templ_2,
      $$_custom_element(DEFINITION, {
        get $children() {
          return $$_ssr($$_templ, id);
        },
      }),
    )"
  `);
});

it('shoud compile child custom element', () => {
  const result = t(`<div><CustomElement $element={DEFINITION} $prop:foo={10} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>\\", \\"</div>\\"];
    $$_ssr($$_templ, $$_custom_element(DEFINITION, { foo: 10 }))"
  `);
});

it('shoud compile with inner html', () => {
  const result = t(
    `<CustomElement $prop:innerHTML="<div>Foo</div>" $element={DEFINITION}><div>Foo</div></CustomElement>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_custom_element } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr(
      $$_templ_2,
      $$_custom_element(DEFINITION, {
        innerHTML: \\"<div>Foo</div>\\",
        get $children() {
          return $$_ssr($$_templ);
        },
      }),
    )"
  `);
});
