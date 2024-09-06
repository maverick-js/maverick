import { ssrH } from '../../transform';

test('simple', () => {
  expect(ssrH(`<Foo />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo);
    "
  `);
});

test('text child', () => {
  expect(ssrH(`<Foo>Foo</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "Foo"
    });
    "
  `);
});

test('one static child element', () => {
  expect(ssrH(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<span></span>"
    });
    "
  `);
});

test('multiple static child elements', () => {
  expect(ssrH(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<span></span><span></span>"
    });
    "
  `);
});

test('one dynamic child element', () => {
  expect(ssrH(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<!$><span></span>"
    });
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(
    ssrH(`<Foo><span on:click={onA}><div on:click={onB} /></span><span on:click={onC} /></Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<!$><span><!$><div></div></span><!$><span></span>"
    });
    "
  `);
});

test('one static child expression', () => {
  expect(ssrH(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "foo"
    });
    "
  `);
});

test('one dynamic child expression', () => {
  expect(ssrH(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => $$_escape(a())
    });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    ssrH(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => [a() ? $$_create_component(Foo) : null, b() ? "<!$><span></span>" : null]
    });
    "
  `);
});
