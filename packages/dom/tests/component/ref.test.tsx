import { Component, type CustomElementOptions, Host, type JSX } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('ref', () => {
  class Foo extends Component {
    static element: CustomElementOptions = {
      name: '',
      defaultTag: 'div',
    };

    override render(): JSX.Element {
      return <Host />;
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
