import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

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
