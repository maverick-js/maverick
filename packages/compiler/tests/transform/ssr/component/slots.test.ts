import { ssr } from '../../transform';

test('text', () => {
  expect(ssr('<Foo>Hello</Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "Hello"
    });
    "
  `);
});

test('single static element in default slot', () => {
  expect(ssr('<Foo><div /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<div></div>"
    });
    "
  `);
});

test('single static element in named slot', () => {
  expect(ssr('<Foo><div slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "foo": () => "<div></div>"
    });
    "
  `);
});

test('single dynamic element in default slot', () => {
  expect(ssr('<Foo><div on:click /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<!$><div></div>"
    });
    "
  `);
});

test('single dynamic element in named slot', () => {
  expect(ssr('<Foo><div on:click slot="foo" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "foo": () => "<!$><div></div>"
    });
    "
  `);
});

test('multiple static elements in default slot', () => {
  expect(ssr('<Foo><div /><span /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<div></div><span></span>"
    });
    "
  `);
});

test('multiple static elements in named slot', () => {
  expect(ssr('<Foo><div slot="foo" /><span slot="bar" /></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "foo": () => "<div></div>",
        "bar": () => "<span></span>"
    });
    "
  `);
});

test('default namespaced slot', () => {
  expect(ssr('<Foo><Foo.Slot><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => "<div></div>"
    });
    "
  `);
});

test('named namespaced slot', () => {
  expect(ssr('<Foo><Foo.Slot name="foo"><div /></Foo.Slot></Foo>')).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "foo": () => "<div></div>"
    });
    "
  `);
});

test('multiple named namespaced slot', () => {
  expect(
    ssr(
      '<Foo><Foo.Slot name="foo"><div /></Foo.Slot><Foo.Slot name="bar"><div /></Foo.Slot></Foo>',
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "foo": () => "<div></div>",
        "bar": () => "<div></div>"
    });
    "
  `);
});

test('fragment default slot', () => {
  expect(ssr(`<Foo><Fragment><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "default": () => $$_create_component(Fragment, null, {
            "default": () => "<div></div><div></div>"
        })
    });
    "
  `);
});

test('fragment named slot', () => {
  expect(ssr(`<Foo><Fragment slot="foo"><div /><div /></Fragment></Foo>`)).toMatchInlineSnapshot(`
    "import { $$_create_component } from "@maverick-js/ssr";
    $$_create_component(Foo, null, {
        "foo": () => $$_create_component(Fragment, null, {
            "default": () => "<div></div><div></div>"
        })
    });
    "
  `);
});

test('render function', () => {
  expect(ssr(`<Foo>{(props) => <div>{props.foo}</div>}</Foo>`)).toMatchInlineSnapshot(`
    "import { $$_escape, $$_ssr, $$_create_component } from "@maverick-js/ssr";
    let $$_t_1 = ["<div>", "</div>"];
    $$_create_component(Foo, null, {
        "default": (props) => $$_ssr($$_t_1, [$$_escape(props.foo)])
    });
    "
  `);
});
