import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_root.fooBar = \\"baz\\";

      return $$_root;
    })()"
  `);
});

it('should compile dynamic $prop expression', () => {
  const result = t(`<div $prop:foo={id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_root.foo = id;

      return $$_root;
    })()"
  `);
});

it('should compile observable $prop expression', () => {
  const result = t(`<div $prop:foo={id()} $prop:bar={props.id}></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_effect, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      $$_effect(() => void ($$_root.foo = id()));
      $$_root.bar = props.id;

      return $$_root;
    })()"
  `);
});

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_create_walker, $$_clone, $$_hydrating, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<!$><div></div>\`);
    (() => {
      const [$$_root, $$_walker] = $$_create_walker($$_templ);

      if (!$$_hydrating) $$_root.innerHTML = \\"baz\\";

      return $$_root;
    })()"
  `);
});
