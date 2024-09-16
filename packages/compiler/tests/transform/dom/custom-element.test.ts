import { dom } from '../transform';

test('add element symbol', () => {
  expect(
    dom(
      `
import { Component } from 'maverick.js';

class Foo extends Component {
  static tagName = 'foo-element';
}

class Bar extends Component {
  static tagName = 'bar-element';
}

class Hux extends Component {}

class Lux {}
    `,
      { customElements: true },
    ),
  ).toMatchInlineSnapshot(`
    "import { Component } from 'maverick.js';
    class Foo extends Component {
        static [Symbol.for("element")] = true;
        static tagName = 'foo-element';
    }
    class Bar extends Component {
        static [Symbol.for("element")] = true;
        static tagName = 'bar-element';
    }
    class Hux extends Component {
    }
    class Lux {
    }
    "
  `);
});
