import { ssr } from '../transform';

test('add element symbol', () => {
  expect(
    ssr(
      `
import { Component } from 'maverick.js';
class Foo extends Component {
  static tagName = 'foo-element';
}`,
      { customElements: true },
    ),
  ).toMatchInlineSnapshot(`
    "import { Component } from 'maverick.js';
    class Foo extends Component {
        static [Symbol.for("maverick.element")] = true;
        static tagName = 'foo-element';
    }
    "
  `);
});
