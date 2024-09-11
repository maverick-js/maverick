import { element } from '../transform';

test('', () => {
  expect(
    element(`
import { Component } from 'maverick.js';

class Foo extends Component {
  static tagName = 'foo-element';
  render() {
    return <host />
  }
}
    `),
  ).toMatchInlineSnapshot(`
    "import { Component } from 'maverick.js';
    import { $$_clone, $$_create_template } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<host></host>");
    class Foo extends Component {
        static tagName = 'foo-element';
        render() {
            return $$_clone($_t_1);
        }
    }
    "
  `);
});
