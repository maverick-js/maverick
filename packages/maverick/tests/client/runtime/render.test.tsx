import { signal, tick } from 'maverick.js';

import { render } from 'maverick.js/dom';

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
        Child Text
        <!--$-->
      </div>
      <div>
        Child Text
        <!--$-->
      </div>
      <div>
        Text
      </div>
      <div>
        <!--$-->
      </div>
    </root>
  `);

  expect(<Fragment />).toBeInstanceOf(Array);
});

it('should be reactive', () => {
  const root = element('root');
  let next!: () => void;

  const input = <InputField next={(n) => (next = n)} />;

  render(() => input, { target: root });
  tick();

  expect(root).toMatchSnapshot();

  const getValueTextNode = () => root.querySelector('span')!.childNodes[1];

  const valueText = getValueTextNode();
  expect(valueText).toBeInstanceOf(Text);

  const inputElement = root.querySelector('input');
  expect(inputElement).toBeInstanceOf(HTMLInputElement);

  next();
  tick();

  expect(root).toMatchSnapshot();

  // it should re-use existing node.
  expect(getValueTextNode()).toBe(valueText);

  inputElement!.dispatchEvent(new CustomEvent('next'));
  tick();

  expect(root).toMatchSnapshot();
});

it('should render signal component', () => {
  function Component(props) {
    return props.$children;
  }

  const $count = signal(1);

  const $component = signal(
    <Component>
      <span>{$count()}</span>
      <span>{$count()}</span>
    </Component>,
  );

  const root = element('root');
  render(() => $component, { target: root });

  expect(root).toMatchInlineSnapshot(`
    <root>
      <span>
        1
        <!--$-->
      </span>
      <span>
        1
        <!--$-->
      </span>
    </root>
  `);

  $component.set(
    <Component>
      <span>Foo</span>
      <span>Bar</span>
    </Component>,
  );

  tick();

  expect(root).toMatchInlineSnapshot(`
    <root>
      <span>
        Foo
      </span>
      <span>
        Bar
      </span>
    </root>
  `);
});
