import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"\\"];

    function Component() {
      return $$_ssr($$_templ_2, id > 10 ? $$_ssr($$_templ, id) : 20);
    }
      "
  `);
});

it('should forward single call expression', () => {
  const result = t(`<Component>{() => <div>{id()}</div>}</Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_create_component(Component, {
      get $children() {
        return () => $$_ssr($$_templ, id);
      },
    })"
  `);
});

it('should forward multiple call expressions', () => {
  const result = t(`
<Component>
  {() => <div>{id()}</div>}
  {() => <div>{id()}</div>}
</Component>
`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ $$_templ;

    $$_create_component(Component, {
      get $children() {
        return [() => $$_ssr($$_templ, id), () => $$_ssr($$_templ_2, id)];
      },
    })
    "
  `);
});
