import { observable, render, tick } from 'maverick.js';

import { Element, Fragment } from './fixtures/primitives';
import { InputField } from './fixtures/reactivity';
import { element } from './utils';

it('should render element', () => {
  const root = element('root');

  render(() => <Element />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div />
    </root>
  `);

  expect(root.firstElementChild).toBeInstanceOf(HTMLDivElement);
  expect(<Element />).toBeInstanceOf(HTMLDivElement);
});

it('should render fragment', () => {
  const root = element('root');

  render(() => <Fragment />, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div />
      <div />
      <div />
    </root>
  `);

  expect(Array.isArray(<Fragment />)).toBeTruthy();
  expect(((<Fragment />) as any[])[0]).toBeInstanceOf(HTMLDivElement);
});

it('should render components', () => {
  function Component(props) {
    return props.$children;
  }

  function ChildComponent(props) {
    return <div>{props.$children}</div>;
  }

  const root = element('root');

  render(
    () => (
      <Component>
        Text
        <div>Text</div>
        <ChildComponent>Child Text</ChildComponent>
        <ChildComponent>Child Text</ChildComponent>
        <div>Text</div>
        <ChildComponent />
      </Component>
    ),
    { target: root },
  );

  expect(root).toMatchInlineSnapshot(`
    <root>
      Text
      <div>
        Text
      </div>
      <div>
        <!--$-->
        Child Text
        <!--/$-->
      </div>
      <div>
        <!--$-->
        Child Text
        <!--/$-->
      </div>
      <div>
        Text
      </div>
      <div>
        <!--$-->
        <!--/$-->
      </div>
    </root>
  `);

  expect(<Fragment />).toBeInstanceOf(Array);
});

it('should be reactive', async () => {
  const root = element('root');
  let next!: () => void;

  const input = <InputField next={(n) => (next = n)} />;

  render(() => input, { target: root });
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        <span>
          Count is 
          <!--$-->
          1
          <!--/$-->
        </span>
        <!--$-->
        <input
          type="number"
        />
      </div>
    </root>
  `);

  const getValueTextNode = () => root.querySelector('span')!.childNodes[2];

  const valueText = getValueTextNode();
  expect(valueText).toBeInstanceOf(Text);

  const inputElement = root.querySelector('input');
  expect(inputElement).toBeInstanceOf(HTMLInputElement);

  next();
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        <span>
          Count is 
          <!--$-->
          2
          <!--/$-->
        </span>
        <!--$-->
        <input
          type="number"
        />
      </div>
    </root>
  `);

  // it should re-use existing node.
  expect(getValueTextNode()).toBe(valueText);

  inputElement!.dispatchEvent(new CustomEvent('next'));
  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <div>
        <span>
          Count is 
          <!--$-->
          3
          <!--/$-->
        </span>
        <!--$-->
        <input
          type="number"
        />
      </div>
    </root>
  `);
});

it('should render observable component', async () => {
  function Component(props) {
    return props.$children;
  }

  const $count = observable(1);

  const $component = observable(
    <Component>
      <span>{$count()}</span>
      <span>{$count()}</span>
    </Component>,
  );

  const root = element('root');
  render(() => $component, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <span>
        <!--$-->
        1
        <!--/$-->
      </span>
      <span>
        <!--$-->
        1
        <!--/$-->
      </span>
      <!--/$-->
    </root>
  `);

  $component.set(
    <Component>
      <span>Foo</span>
      <span>Bar</span>
    </Component>,
  );

  await tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <span>
        Foo
      </span>
      <span>
        Bar
      </span>
      <!--/$-->
    </root>
  `);
});
