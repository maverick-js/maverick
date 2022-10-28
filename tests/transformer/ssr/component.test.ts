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
      get children() {
        return [
          \\"Text\\",
          $$_ssr($$_templ),
          $$_create_component(Foo),
          $$_create_component(Bar, {
            get children() {
              return [$$_ssr($$_templ_2), $$_create_component(Baz)];
            },
          }),
        ];
      },
    })
    "
  `);
});

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];

    function Component() {
      return id > 10 ? $$_ssr($$_templ, id) : 20;
    }
      "
  `);
});

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={10} boo={true} baz={id()} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component, { foo: \\"a\\", bar: 10, boo: true, baz: id })"
  `);
});

it('should compile component with spread', () => {
  const result = t(`<Component {...props} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component, props)"
  `);
});

it('should compile component with multiple spreads', () => {
  const result = t(`<Component {...props} {...propsTwo} {...propsThree} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/ssr\\";
    $$_create_component(Component, $$_merge_props(props, propsTwo, propsThree))"
  `);
});

it('should compile component with props and spread', () => {
  const result = t(`<Component foo="..." {...props} bar={id() + 10} baz={id} {...propsTwo} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component, $$_merge_props } from \\"maverick.js/ssr\\";
    $$_create_component(
      Component,
      $$_merge_props({ foo: \\"...\\" }, props, {
        get bar() {
          return id() + 10;
        },
        baz: id,
      }, propsTwo),
    )"
  `);
});

it('should compile component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_component } from \\"maverick.js/ssr\\";
    $$_create_component(Component, {
      get children() {
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
      get children() {
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
      get children() {
        return $$_ssr($$_templ);
      },
    })"
  `);
});

it('should forward single call expression', () => {
  const result = t(`<Component>{() => <div>{id()}</div>}</Component>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_create_component } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_create_component(Component, {
      get children() {
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
      get children() {
        return [() => $$_ssr($$_templ, id), () => $$_ssr($$_templ_2, id)];
      },
    })
    "
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
      get children() {
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
