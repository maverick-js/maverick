import { ssr } from '../transform';

test('add element symbol', () => {
  expect(
    ssr(
      `
import { MaverickComponent } from 'maverick.js';
class Foo extends MaverickComponent {
  static element = {
    name: 'foo-element'
  }
}`,
      { customElements: true },
    ),
  ).toMatchInlineSnapshot(`
    "import { CUSTOM_ELEMENT_SYMBOL } from "maverick.js";
    import { MaverickComponent } from 'maverick.js';
    class Foo extends MaverickComponent {
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
