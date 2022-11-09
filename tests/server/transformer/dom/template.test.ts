import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should return sourcemap', () => {
  const result = transform(`<div></div>`, { filename: 'foo.tsx', sourcemap: true });
  expect(result.map).toBeDefined();
  expect(result.map!.sources[0]).toBe('foo.tsx');
});

it('should compile single JSX node', () => {
  const result = t(`<div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile single self-closing JSX node', () => {
  const result = t(`<div />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile multiple JSX nodes', () => {
  const result = t(`<div><span id="a"></span><span id="b"></span></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><span id=\\"a\\"></span><span id=\\"b\\"></span></div>\`);
    $$_clone($$_templ)"
  `);
});

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<div id=\\"b\\"></div>\`);
    [$$_clone($$_templ), $$_clone($$_templ_2)]"
  `);
});

it('should compile child fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div id=\\"root\\"><div id=\\"a\\"></div><div id=\\"b\\"></div></div>\`);
    $$_clone($$_templ)"
  `);
});

it('shoud merge duplicate templates', () => {
  const result = t(`
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
`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_templ,
      $$_templ_3 = /* #__PURE__ */ $$_create_template(\`<div>Foo</div>\`),
      $$_templ_4 = /* #__PURE__ */ $$_templ_3,
      $$_templ_5 = /* #__PURE__ */ $$_create_template(\`<div>Bar</div>\`),
      $$_templ_6 = /* #__PURE__ */ $$_create_template(\`<span></span>\`),
      $$_templ_7 = /* #__PURE__ */ $$_create_template(\`<span>Foo</span>\`),
      $$_templ_8 = /* #__PURE__ */ $$_templ_7,
      $$_templ_9 = /* #__PURE__ */ $$_templ_7,
      $$_templ_10 = /* #__PURE__ */ $$_create_template(\`<span>Bar</span>\`);

    $$_clone($$_templ)
    $$_clone($$_templ_2)
    $$_clone($$_templ_3)
    $$_clone($$_templ_4)
    $$_clone($$_templ_5)
    $$_clone($$_templ_6)
    $$_clone($$_templ_7)
    $$_clone($$_templ_8)
    $$_clone($$_templ_9)
    $$_clone($$_templ_10)
    "
  `);
});
