import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile root component', () => {
  const result = t(`<Component />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component)"
  `);
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, $$_create_component(Component))"
  `);
});

it('should compile nested components', () => {
  const result = t(`
<Component>
  Text
  <div>
    <span>Text</span>
  </div>
  <Foo />
  <Bar>
    <div></div>
    <Baz />
  </Bar>
</Component>
`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><span>Text</span></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div></div>\\"];

    $$_create_component(Component, {
      get $children() {
        return [
          \\"Text\\",
          $$_ssr($$_templ),
          $$_create_component(Foo),
          $$_create_component(Bar, {
            get $children() {
              return [$$_ssr($$_templ_2), $$_create_component(Baz)];
            },
          }),
        ];
      },
    })
    "
  `);
});
