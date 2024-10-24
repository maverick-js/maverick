import { Component, type CustomElementOptions, Host } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

class Foo extends Component {
  static element: CustomElementOptions = {
    name: 'mk-foo',
    defaultTag: 'div',
  };

  override render() {
    return (
      <Host data-foo>
        <div>Foo Content</div>
        <Bar />
      </Host>
    );
  }
}

class Bar extends Component {
  static element: CustomElementOptions = {
    name: 'mk-bar',
    defaultTag: 'div',
  };

  override render() {
    return (
      <Host data-bar>
        <div>Bar Content</div>
      </Host>
    );
  }
}

test('render', () => {
  render(() => <Foo />, { target });
  expect(target).toMatchSnapshot();
});
