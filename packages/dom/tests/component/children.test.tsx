import { getSlots, type JSX, type MaverickFunctionProps } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('none', () => {
  function Foo(props: MaverickFunctionProps) {
    return null;
  }

  render(() => <Foo />, { target });

  expect(target).toMatchSnapshot();
});

test('expression', () => {
  function Foo(props: MaverickFunctionProps) {
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

  function Bar(props: MaverickFunctionProps) {
    const slots = getSlots();
    return (
      <>
        <span>{slots.default?.()}</span>
        <Bux />
      </>
    );
  }

  function Foo(props: MaverickFunctionProps) {
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
