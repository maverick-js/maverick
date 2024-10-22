import { type FunctionComponentProps } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('ref', () => {
  function Foo(props: FunctionComponentProps) {
    return <div></div>;
  }

  let el;

  render(
    () => (
      <Foo
        ref={(e) => {
          el = e;
        }}
      />
    ),
    { target },
  );

  expect(el).toBeInstanceOf(HTMLDivElement);
});
