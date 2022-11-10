import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should compile expression', () => {
  const result = t(`id > 10 && <div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ_2, id > 10 && $$_ssr($$_templ, id))"
  `);
});

it('should compile dynamic binary expression', () => {
  const result = t(`id() > 10 && <div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ_2, () => id() > 10 && $$_ssr($$_templ, id))"
  `);
});

it('should compile conditional expression', () => {
  const result = t(`1 > 2 ? <div>{id}</div> : props.id > 10 ? <div>Bar</div> : <div>Baz</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div>Bar</div>\\"],
      $$_templ_3 = /* #__PURE__ */ [\\"<!$><div>Baz</div>\\"],
      $$_templ_4 = /* #__PURE__ */ [\\"\\"];
    $$_ssr($$_templ_4, () => 1 > 2 ? $$_ssr($$_templ, id) : props.id > 10 ? $$_ssr($$_templ_2) : $$_ssr($$_templ_3))"
  `);
});

it('should compile child jsx expression', () => {
  const result = t(`<div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, id)"
  `);
});

it('should compile sibling jsx expression', () => {
  const result = t(`<div><div></div>{id}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><div></div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, id)"
  `);
});

it('should compile deep jsx expression', () => {
  const result = t(`<div><div>{id}</div></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><div><!$>\\", \\"</div></div>\\"];
    $$_ssr($$_templ, id)"
  `);
});

it('should compile dynamic child jsx expression', () => {
  const result = t(`<div>{id() + 10}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ, () => id() + 10)"
  `);
});

it('should compile conditional jsx expression ', () => {
  const result = t(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"b\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ_2, id > 10 && $$_ssr($$_templ))"
  `);
});

it('should compile dynamic conditional jsx expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id()}></div>}</div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"b\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"><!$>\\", \\"</div>\\"];
    $$_ssr($$_templ_2, () => id() > 10 && $$_ssr($$_templ))"
  `);
});
