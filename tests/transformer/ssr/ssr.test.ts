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

it('should compile child fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"root\\\\\\"><div id=\\\\\\"a\\\\\\"></div><div id=\\\\\\"b\\\\\\"></div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('shoud compile custom element', () => {
  const result = t(`<CustomElement element={DEFINITION} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr($$_templ, $$_custom_element(DEFINITION))"
  `);
});

it('shoud compile custom element with attrs/props', () => {
  const result = t(
    `<CustomElement foo={10} bar={20} $prop:foo={10} $prop:bar={id()} element={DEFINITION} />`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr($$_templ, $$_custom_element(DEFINITION, { foo: 10, bar: id }, [{ \\"foo\\": 10, \\"bar\\": 20 }]))"
  `);
});

it('shoud compile custom element with children', () => {
  const result = t(`<CustomElement element={DEFINITION}><div>{id}</div></CustomElement>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_custom_element } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr(
      $$_templ_2,
      $$_custom_element(DEFINITION, {
        get children() {
          return $$_ssr($$_templ, id);
        },
      }),
    )"
  `);
});

it('shoud compile child custom element', () => {
  const result = t(`<div><CustomElement element={DEFINITION} $prop:foo={10} /></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_custom_element, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>\\", \\"</div>\\"];
    $$_ssr($$_templ, $$_custom_element(DEFINITION, { foo: 10 }))"
  `);
});

it('shoud compile custom element with inner html', () => {
  const result = t(
    `<CustomElement $prop:innerHTML="<div>Foo</div>" element={DEFINITION}><div>Foo</div></CustomElement>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr, $$_custom_element } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>Foo</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$>\\"];
    $$_ssr(
      $$_templ_2,
      $$_custom_element(DEFINITION, {
        innerHTML: \\"<div>Foo</div>\\",
        get children() {
          return $$_ssr($$_templ);
        },
      }),
    )"
  `);
});

it('should compile shorthand boolean attribute', () => {
  const result = t(`<button disabled />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><button disabled=\\\\\\"\\\\\\"></button>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attributes', () => {
  const result = t(`<div class="foo bar" style="baz daz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div class=\\\\\\"foo bar\\\\\\" style=\\\\\\"baz daz\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attribute (number)', () => {
  const result = t(`<div foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div foo=\\\\\\"10\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attribute (boolean)', () => {
  const result = t(`<div foo={true} bar={false}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div foo=\\\\\\"true\\\\\\" bar=\\\\\\"false\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static attribute (template string)', () => {
  const result = t(`<div foo={\`bar-baz\`} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div foo=\\\\\\"bar-baz\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile spread', () => {
  const result = t(`<div {...props} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_spread([props]))"
  `);
});

it('should compile spread with attributes', () => {
  const result = t(`<div a="0" b="1" c={id} {...props} d={true} e={10} {...propsTwo}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_spread([{ \\"a\\": \\"0\\", \\"b\\": \\"1\\", \\"c\\": id }, props, { \\"d\\": true, \\"e\\": 10 }, propsTwo]))"
  `);
});

it('should merge classes between spreads', () => {
  const result = t(
    `<div $class:a={id} $class:b={false} class="foo bar" {...props} $class:c={0} {...propsTwo}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr(
      $$_templ,
      $$_spread([{ \\"class\\": \\"foo bar\\", \\"$$class\\": { \\"a\\": id, \\"b\\": false } }, props, { \\"$$class\\": { \\"c\\": 0 } }, propsTwo]),
    )"
  `);
});

it('should merge classes after spread', () => {
  const result = t(`<div {...props} $class:a={id} $class:b={false} class="foo bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_spread([props, { \\"class\\": \\"foo bar\\", \\"$$class\\": { \\"a\\": id, \\"b\\": false } }]))"
  `);
});

it('should merge styles between spreads', () => {
  const result = t(
    `<div $style:a={id} $style:b={false} style="foo bar" {...props} $style:c={0} {...propsTwo}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr(
      $$_templ,
      $$_spread([{ \\"style\\": \\"foo bar\\", \\"$$style\\": { \\"a\\": id, \\"b\\": false } }, props, { \\"$$style\\": { \\"c\\": 0 } }, propsTwo]),
    )"
  `);
});

it('should merge styles after spread', () => {
  const result = t(
    `<div {...props} $style:a={id} $style:b={false} style="foo bar"  $style:c={0}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_spread([props, { \\"style\\": \\"foo bar\\", \\"$$style\\": { \\"a\\": id, \\"b\\": false, \\"c\\": 0 } }]))"
  `);
});

it('should merge spreads', () => {
  const result = t(`<div {...props} {...propsTwo} {...propsThree} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_spread([props, propsTwo, propsThree]))"
  `);
});

it('should compile dynamic attribute', () => {
  const result = t(`<div foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_attr(\\"foo\\", id))"
  `);
});

it('should compile observable attribute', () => {
  const result = t(`<div foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_attr, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_attr(\\"foo\\", id))"
  `);
});

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"><div>Foo</div><div>Bar</div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div>\\", \\"</div>\\"];
    $$_ssr($$_templ, $$_inject_html(\\"baz\\"))"
  `);
});

it('should _not_ compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile static class attribute', () => {
  const result = t(`<div class="foo bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div class=\\\\\\"foo bar\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile dynamic class attribute', () => {
  const result = t(`<div class={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(id))"
  `);
});

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(\\"\\", { \\"foo\\": true }))"
  `);
});

it('should compile multiple $class expressions', () => {
  const result = t(
    `<div class="foo bar" $class:foo={true} $class:bar={false} $class:baz={true}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(\\"foo bar\\", { \\"foo\\": true, \\"bar\\": false, \\"baz\\": true }))"
  `);
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_classes, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_classes(\\"\\", { \\"foo\\": id }))"
  `);
});

it('should compile static style attribute', () => {
  const result = t(`<div style="foo: 1; bar: 2;"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div style=\\\\\\"foo: 1; bar: 2\\\\\\"></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile dynamic style attribute', () => {
  const result = t(`<div style={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(id))"
  `);
});

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"foo\\": \\"bar\\" }))"
  `);
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"foo\\": id }))"
  `);
});

it('should group multiple static $style expressions', () => {
  const result = t(
    `<div style="foo: a;" $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"foo: a;\\", { \\"foo\\": \\"b\\", \\"bar\\": true, \\"baz\\": id }))"
  `);
});

it('should compile observable $style expression', () => {
  const result = t(`<div style={id()} $style:foo={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(id, { \\"foo\\": id }))"
  `);
});

it('should compile $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={10}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"--foo\\": 10 }))"
  `);
});

it('should group multiple static $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $cssvar:foo={10} $cssvar:bar={'align-content'} $cssvar:baz={id}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"pre: 10\\", { \\"--foo\\": 10, \\"--bar\\": \\"align-content\\", \\"--baz\\": id }))"
  `);
});

it('should group multiple static $style and $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $style:baz={\`content\`} $style:boo={20} $cssvar:foo={10} $cssvar:bar={'align-content'}></div>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"pre: 10\\", { \\"baz\\": \`content\`, \\"boo\\": 20, \\"--foo\\": 10, \\"--bar\\": \\"align-content\\" }))"
  `);
});

it('should compile dynamic $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"--foo\\": id }))"
  `);
});

it('should compile observable $cssvar expression', () => {
  const result = t(`<div $cssvar:foo-bar={id()}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_styles, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_styles(\\"\\", { \\"--foo-bar\\": id }))"
  `);
});

it('should _not_ compile $use expression', () => {
  const result = t(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should _not_ compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should _not_ compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should _not_ compile $oncapture expression', () => {
  const result = t(`<div $oncapture:foo={(e) => {}} />`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div></div>\\"];
    $$_ssr($$_templ)"
  `);
});

it('should compile child expression', () => {
  const result = t(`<div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, id)"
  `);
});

it('should compile sibling expression', () => {
  const result = t(`<div><div></div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><div></div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, id)"
  `);
});

it('should compile deep expression', () => {
  const result = t(`<div><div>{id}</div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><div><!$>\\", \\"</div></div>\\"];
    $$_ssr($$_templ, id)"
  `);
});

it('should compile observable child expression', () => {
  const result = t(`<div>{id() + 10}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, () => id() + 10)"
  `);
});

it('should compile conditional element expression ', () => {
  const result = t(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"b\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ_2, id > 10 && $$_ssr($$_templ))"
  `);
});

it('should compile observable conditional element expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id()}></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"b\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ_2, () => id() > 10 && $$_ssr($$_templ))"
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

    $$_ssr($$_templ)
    $$_ssr($$_templ_2)
    $$_ssr($$_templ_3)
    $$_ssr($$_templ_4)
    $$_ssr($$_templ_5)
    $$_ssr($$_templ_6)
    $$_ssr($$_templ_7)
    $$_ssr($$_templ_8)
    $$_ssr($$_templ_9)
    $$_ssr($$_templ_10)
    "
  `);
});
