import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should return sourcemap', () => {
  const result = transform(`<div></div>`, { filename: 'foo.tsx', sourcemap: true });
  expect(result.map).toBeDefined();
  expect(result.map!.sources[0]).toBe('foo.tsx');
});

it('should compile single JSX node', () => {
  const result = t(`<div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile single self-closing JSX node', () => {
  const result = t(`<div />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile multiple JSX nodes', () => {
  const result = t(`<div><span id="a"></span><span id="b"></span></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><span id=\\\\\\"a\\\\\\"></span><span id=\\\\\\"b\\\\\\"></span></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"b\\\\\\"></div>\\"];
    [$$_ssr($$_templ), $$_ssr($$_templ_2)]"
  `);
});

it('should compile fragment with dynamic child', () => {
  const result = t(`<><div id="a"></div><div id={b}></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_attr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    [$$_ssr($$_templ), $$_ssr($$_templ_2, $$_attr(\\"id\\", b))]"
  `);
});

it('should compile child fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"root\\\\\\"><div id=\\\\\\"a\\\\\\"></div><div id=\\\\\\"b\\\\\\"></div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('shoud merge duplicate templates', () => {
  const result = t(`
<>
<div></div>
<div></div>
<div>Foo</div>
<div>Foo</div>
<div>Bar</div>
<span></span>
<span>Foo</span>
<span>Foo</span>
<span>Foo</span>
<span>Bar</span>
</>
`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"],
      $$_templ_2 = /* #__PURE__ */ $$_templ,
      $$_templ_3 = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"],
      $$_templ_4 = /* #__PURE__ */ $$_templ_3,
      $$_templ_5 = /* #__PURE__ */ [\\"<!$><div>Bar</div>\\"],
      $$_templ_6 = /* #__PURE__ */ [\\"<!$><span></span>\\"],
      $$_templ_7 = /* #__PURE__ */ [\\"<!$><span>Foo</span>\\"],
      $$_templ_8 = /* #__PURE__ */ $$_templ_7,
      $$_templ_9 = /* #__PURE__ */ $$_templ_7,
      $$_templ_10 = /* #__PURE__ */ [\\"<!$><span>Bar</span>\\"];

    [
      $$_ssr($$_templ),
      $$_ssr($$_templ_2),
      $$_ssr($$_templ_3),
      $$_ssr($$_templ_4),
      $$_ssr($$_templ_5),
      $$_ssr($$_templ_6),
      $$_ssr($$_templ_7),
      $$_ssr($$_templ_8),
      $$_ssr($$_templ_9),
      $$_ssr($$_templ_10),
    ]
    "
  `);
});
