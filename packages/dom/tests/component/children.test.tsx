import { getSlots, type HasSlots } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('none', () => {
  function Foo() {
    return null;
  }

  render(() => <Foo />, { target });

  expect(target).toMatchSnapshot();
});

test('expression', () => {
  function Foo(props: HasSlots) {
    const slots = getSlots();
    return slots.default?.();
  }

  const text = 'Hello World!';
  render(() => <Foo>{text}</Foo>, { target });

  expect(target).toMatchSnapshot();
});

test('component', () => {
  function Bux() {
    return <span>Bux</span>;
  }

  function Bar(props: HasSlots) {
    const slots = getSlots();
    return (
      <>
        <span>{slots.default?.()}</span>
        <Bux />
      </>
    );
  }

  function Foo(props: HasSlots) {
    const slots = getSlots();
    return <div>{slots.default?.()}</div>;
  }

  render(
    () => (
      <Foo>
        <Bar>Bar</Bar>
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});
