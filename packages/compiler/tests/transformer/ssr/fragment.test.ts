import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

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

it('should compile fragment with jsx expressions', () => {
  const result = t(
    `<><div id="a"></div>{false && <div>Ignore</div>}<div>B</div>{10 + 20}{$id()}{$id() + 2}</>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div id=\\\\\\"a\\\\\\"></div>\\"],
      $$_templ_2 = /* #__PURE__ */ [\\"<!$><div>Ignore</div>\\"],
      $$_templ_3 = /* #__PURE__ */ [\\"<!$><div>B</div>\\"],
      $$_templ_4 = /* #__PURE__ */ [\\"\\"],
      $$_templ_5 = /* #__PURE__ */ $$_templ_4,
      $$_templ_6 = /* #__PURE__ */ $$_templ_4;
    [
      $$_ssr($$_templ),
      false && $$_ssr($$_templ_2),
      $$_ssr($$_templ_3),
      $$_ssr($$_templ_4, 10 + 20),
      $$_ssr($$_templ_5, $id),
      $$_ssr($$_templ_6, $id() + 2),
    ]"
  `);
});
