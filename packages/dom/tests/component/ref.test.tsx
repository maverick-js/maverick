import { Component, Host, type JSX } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('ref', () => {
  class Foo extends Component {
    override render(): JSX.Element {
      return <Host as="div" />;
    }
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
