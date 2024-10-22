import { Component, type CustomElementOptions, Host } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

class Foo extends Component {
  static element: CustomElementOptions = {
    name: 'mk-foo',
  };

  override render() {
    return (
      <Host data-foo as="div">
        <div>Foo Content</div>
        <Bar />
      </Host>
    );
  }
}

class Bar extends Component {
  static element: CustomElementOptions = {
    name: 'mk-bar',
  };

  override render() {
    return (
      <Host data-bar as="div">
        <div>Bar Content</div>
      </Host>
    );
  }
}

test('render', () => {
  render(() => <Foo />, { target });
  expect(target).toMatchSnapshot();
});
