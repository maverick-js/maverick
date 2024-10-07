import { ssr } from '../transform';

test('add element symbol', () => {
  expect(
    ssr(
      `
import { Component } from 'maverick.js';
class Foo extends Component {
  static element = {
    name: 'foo-element'
  }
}`,
      { customElements: true },
    ),
  ).toMatchInlineSnapshot(`
    "import { CUSTOM_ELEMENT_SYMBOL } from "maverick.js";
    import { Component } from 'maverick.js';
    class Foo extends Component {
        static [CUSTOM_ELEMENT_SYMBOL]() {
            return true;
        }
        static element = {
            name: 'foo-element'
        };
    }
    "
  `);
});
