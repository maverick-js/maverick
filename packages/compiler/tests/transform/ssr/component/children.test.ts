import { ssr } from '../../transform';

test('simple', () => {
  expect(ssr(`<Foo />`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo);
    "
  `);
});

test('text child', () => {
  expect(ssr(`<Foo>Hello</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "Hello"
    });
    "
  `);
});

test('one static child element', () => {
  expect(ssr(`<Foo><span /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<span></span>"
    });
    "
  `);
});

test('multiple static child elements', () => {
  expect(ssr(`<Foo><span></span><span></span></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<span></span><span></span>"
    });
    "
  `);
});

test('one dynamic child element', () => {
  expect(ssr(`<Foo><span on:click={onClick} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<!$><span></span>"
    });
    "
  `);
});

test('multiple dynamic child elements', () => {
  expect(ssr(`<Foo><span on:click={onA} /><span on:click={onB} /></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<!$><span></span><!$><span></span>"
    });
    "
  `);
});

test('one static child expression', () => {
  expect(ssr(`<Foo>{"foo"}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "foo"
    });
    "
  `);
});

test('one dynamic child expression', () => {
  expect(ssr(`<Foo>{a()}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => $$_escape(a())
    });
    "
  `);
});

test('multiple dynamic child expressions', () => {
  expect(
    ssr(`<Foo>{a() ? <Foo on:click={onA} /> : null}{b() ? <span on:click={onB} /> : null}</Foo>`),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => [a() ? $$_create_component(Foo) : null, b() ? "<!$><span></span>" : null]
    });
    "
  `);
});
