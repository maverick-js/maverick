import { dom } from '../transform';

test('add element symbol', () => {
  expect(
    dom(
      `
import { MaverickComponent } from '@maverick-js/core';

class Foo extends MaverickComponent {
  static element = {
    name: 'foo-element'
  }
}

class Bar extends MaverickComponent {
  static element = {
    name: 'bar-element'
  }
}

class Hux extends MaverickComponent {}

class Lux {}
    `,
      { customElements: true },
    ),
  ).toMatchInlineSnapshot(`
    "import { $$_create_custom_element } from "@maverick-js/element";
    import { CUSTOM_ELEMENT_SYMBOL } from "@maverick-js/core";
    import { MaverickComponent } from '@maverick-js/core';
    class Foo extends MaverickComponent {
        static [CUSTOM_ELEMENT_SYMBOL]() {
            return $$_create_custom_element(this);
        }
        static element = {
            name: 'foo-element'
        };
    }
    class Bar extends MaverickComponent {
        static [CUSTOM_ELEMENT_SYMBOL]() {
            return $$_create_custom_element(this);
        }
        static element = {
            name: 'bar-element'
        };
    }
    class Hux extends MaverickComponent {
    }
    class Lux {
    }
    "
  `);
});

test('should import node', () => {
  expect(
    dom(
      `
import { MaverickComponent } from '@maverick-js/core';

class Foo extends MaverickComponent {
  static element = {
    name: 'bar-element'
  }

  render() {
    return <div><foo-bar></foo-bar></div>
  }
}`,
    ),
  ).toMatchInlineSnapshot(`
    "import { MaverickComponent } from '@maverick-js/core';
    import { $$_create_template } from "@maverick-js/dom";
    let $_template_1 = /* @__PURE__ */ $$_create_template("<div><foo-bar></foo-bar></div>", true);
    class Foo extends MaverickComponent {
        static element = {
            name: 'bar-element'
        };
        render() {
            return $_template_1();
        }
    }
    "
  `);
});
