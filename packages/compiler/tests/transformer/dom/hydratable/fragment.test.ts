import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"b\\"></div>\`);
    [$$_next_template($$_templ), $$_next_template($$_templ_2)]"
  `);
});

it('should compile child fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"root\\"><div id=\\"a\\"></div><div id=\\"b\\"></div></div>\`);
    $$_next_template($$_templ)"
  `);
});

it.only('should compile fragment with jsx expressions', () => {
  const result = t(
    `
<>
  <div id="a"></div>
  {false && <div>Ignore</div>}
  {$id() && <div>Ignore</div>}
  {$id() && <div $on:click={id}>Ignore</div>}
  <div>B</div>
  {"foo"}
  {"foo" + "boo"}
  {$id() + "foo" + "boo"}
  {10 + 20}
  {$id}
  {$id() + 2}
  {$id() ? <Component /> : null}
</>`,
  );
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_next_template, $$_computed, $$_create_walker, $$_clone, $$_listen, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div id=\\"a\\"></div>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<!$><div>Ignore</div>\`),
      $$_templ_3 = /* #__PURE__ */ $$_templ_2,
      $$_templ_4 = /* #__PURE__ */ $$_templ_2,
      $$_templ_5 = /* #__PURE__ */ $$_create_template(\`<!$><div>B</div>\`);

    [
      $$_next_template($$_templ),
      false && $$_next_template($$_templ_2),
      (() => {
        const $$_signal = $$_computed(() => $id() && $$_next_template($$_templ_3));
        $$_signal();
        return $$_signal;
      })(),
      (() => {
        const $$_signal = $$_computed(() =>
          $id() && (() => {
            const [$$_root, $$_walker] = $$_create_walker($$_templ_4);

            $$_listen($$_root, \\"click\\", id);

            return $$_root;
          })()
        );
        $$_signal();
        return $$_signal;
      })(),
      $$_next_template($$_templ_5),
      \\"foo\\",
      \\"foo\\" + \\"boo\\",
      $$_computed(() => $id() + \\"foo\\" + \\"boo\\"),
      10 + 20,
      $id,
      $$_computed(() => $id() + 2),
      (() => {
        const $$_signal = $$_computed(() => $id() ? $$_create_component(Component) : null);
        $$_signal();
        return $$_signal;
      })(),
    ]"
  `);
});
