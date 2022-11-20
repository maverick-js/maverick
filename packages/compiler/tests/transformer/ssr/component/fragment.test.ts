import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

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

it('should compile component child fragment', () => {
  const result = t(
    `
<Component>
  <>
  <div id="foo">{id()}</div>
  <div id="bar">{id()}</div>
  {"foo"}
  {10 + 20}
  {id}
  <div></div>
  {id()}
  </>
</Component>
`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"foo\\\\\\"><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"bar\\\\\\"><!$>\\", \\"</div>\\"],
      $$_templ_3 = /* #__PURE__ */ [\\"foo\\"],
      $$_templ_4 = /* #__PURE__ */ [\\"\\"],
      $$_templ_5 = /* #__PURE__ */ $$_templ_4,
      $$_templ_6 = /* #__PURE__ */ [\\"<!$><div></div>\\"],
      $$_templ_7 = /* #__PURE__ */ [\\"<!$>\\"];

    $$_create_component(Component, {
      get $children() {
        return [
          $$_ssr($$_templ, id),
          $$_ssr($$_templ_2, id),
          $$_ssr($$_templ_3),
          $$_ssr($$_templ_4, 10 + 20),
          $$_ssr($$_templ_5, id),
          $$_ssr($$_templ_6),
          $$_ssr($$_templ_7, id),
        ];
      },
    })
    "
  `);
});
