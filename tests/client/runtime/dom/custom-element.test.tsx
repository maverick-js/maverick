import { CustomElement, observable, render, tick } from 'maverick.js';
import { defineCustomElement, defineElement, MaverickElement } from 'maverick.js/element';

afterEach(() => {
  document.body.innerHTML = '';
});

it('should render custom element', async () => {
  const Button = defineElement({
    tagName: `mk-button-1`,
    setup:
      ({ host }) =>
      () =>
        !host.$children && <div>Internal</div>,
  });

  const root = document.createElement('root');

  const $children = observable(<div>Foo</div>);
  render(() => <CustomElement $element={Button}>{$children()}</CustomElement>, { target: root });
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <shadow-root>
          <!--$$-->
          <!--/$-->
        </shadow-root>
        <!--$$-->
        <div>
          Foo
        </div>
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  $children.set(null);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <shadow-root>
          <!--$$-->
          <div>
            Internal
          </div>
          <!--/$-->
        </shadow-root>
        <!--$$-->
        <!--/$-->
      </mk-button-1>
    </root>
  `);

  $children.set(<div>Bar</div>);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <mk-button-1>
        <shadow-root>
          <!--$$-->
          <!--/$-->
        </shadow-root>
        <!--$$-->
        <div>
          Bar
        </div>
        <!--/$-->
      </mk-button-1>
    </root>
  `);
});

it('should render custom element with only internal content', () => {
  const Button = defineElement({
    tagName: `mk-button-2`,
    setup: () => () => <button>Test</button>,
  });

  const root = document.createElement('root');
  render(() => <CustomElement $element={Button} />, { target: root });

  expect(root).toMatchInlineSnapshot(`
  <root>
    <mk-button-2>
      <shadow-root>
        <button>
          Test
        </button>
      </shadow-root>
      <!--$$-->
      <!--/$-->
    </mk-button-2>
  </root>
`);
});

it('should render custom element with only children', () => {
  const Button = defineElement({
    tagName: `mk-button-3`,
    setup: () => () => null,
  });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Button}>
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
  <root>
    <mk-button-3>
      <shadow-root />
      <!--$$-->
      <div>
        Children
      </div>
      <!--/$-->
    </mk-button-3>
  </root>
`);
});

it('should render custom element with inner html', () => {
  const Button = defineElement({
    tagName: `mk-button-4`,
    setup:
      ({ host }) =>
      () =>
        !host.$children && <div>Foo</div>,
  });

  const root = document.createElement('root');
  render(
    () => (
      <CustomElement $element={Button} $prop:innerHTML="<div>INNER HTML</div>">
        <div>Children</div>
      </CustomElement>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
  <root>
    <mk-button-4>
      <shadow-root>
        <!--$$-->
        <!--/$-->
      </shadow-root>
      <div>
        INNER HTML
      </div>
    </mk-button-4>
  </root>
`);
});

it('should render css vars', () => {
  const Button = defineElement({
    tagName: `mk-button-5`,
    cssvars: {
      foo: 10,
      bar: 'none',
    },
    setup: () => () => null,
  });

  defineCustomElement(Button);

  const element = document.createElement(Button.tagName) as MaverickElement;
  element.$setup();

  expect(element).toMatchInlineSnapshot(`
  <mk-button-5
    style="--foo: 10; --bar: none;"
  >
    <shadow-root />
  </mk-button-5>
`);
});

it('should render css vars builder', async () => {
  const Button = defineElement({
    tagName: `mk-button-6`,
    props: { foo: { initial: 0 } },
    cssvars: (props) => ({
      foo: () => props.foo,
    }),
    setup: () => () => null,
  });

  defineCustomElement(Button);

  const element = document.createElement(Button.tagName) as MaverickElement;
  element.$setup();

  expect(element).toMatchInlineSnapshot(`
  <mk-button-6
    style="--foo: 0;"
  >
    <shadow-root />
  </mk-button-6>
`);

  element.$$props.foo.set(100);
  await tick();

  expect(element).toMatchInlineSnapshot(`
  <mk-button-6
    style="--foo: 100;"
  >
    <shadow-root />
  </mk-button-6>
`);
});

it('should call `$onMount` callback', async () => {
  const Button = defineElement({
    tagName: `mk-button-7`,
    setup: () => () => null,
  });

  defineCustomElement(Button);

  const element = document.createElement(Button.tagName) as MaverickElement;
  element.setAttribute('data-delegate', '');

  const callback = vi.fn();
  element.$onMount(callback);
  expect(callback).not.toBeCalled();

  document.body.appendChild(element);
  element.$setup();

  await tick();
  expect(callback).toHaveBeenCalledOnce();
});

it('should call `$onDestroy` callback', async () => {
  const Button = defineElement({
    tagName: `mk-button-8`,
    setup: () => () => null,
  });

  defineCustomElement(Button);

  const element = document.createElement(Button.tagName) as MaverickElement;
  element.setAttribute('data-delegate', '');

  const callback = vi.fn();
  element.$onDestroy(callback);
  expect(callback).not.toBeCalled();

  document.body.appendChild(element);
  element.$setup();

  await tick();
  expect(callback).not.toBeCalled();

  element.$destroy();

  await tick();
  expect(callback).toHaveBeenCalledOnce();
});

it('should wait for parent to mount', async () => {
  const Parent = defineElement({
    tagName: `mk-parent-1`,
    setup: () => () => null,
  });

  const Child = defineElement({
    tagName: `mk-child-1`,
    parent: Parent,
    setup: () => () => null,
  });

  const parent = document.createElement(Parent.tagName) as MaverickElement;
  parent.setAttribute('data-delegate', '');
  const child = document.createElement(Child.tagName) as MaverickElement;
  parent.append(child);
  document.body.append(parent);

  expect(document.body).toMatchInlineSnapshot(`
  <body>
    <mk-parent-1
      data-delegate=""
    >
      <mk-child-1 />
    </mk-parent-1>
  </body>
`);

  defineCustomElement(Child);
  expect(child.$mounted).toBeFalsy();

  await new Promise((res) => window.requestAnimationFrame(res));
  expect(child.$mounted).toBeFalsy();

  parent.$setup();

  expect(child.$mounted).toBeTruthy();
});
