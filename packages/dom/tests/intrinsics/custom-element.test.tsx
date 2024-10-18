import { render } from '@maverick-js/dom';
import { type CustomElementOptions, Host, MaverickComponent } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

class Foo extends MaverickComponent {
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

class Bar extends MaverickComponent {
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
