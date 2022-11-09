import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

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
