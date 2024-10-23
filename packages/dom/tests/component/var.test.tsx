import { Component, Host, type JSX, signal, tick } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('host vars', () => {
  type Color = 'red' | 'orange';

  interface CSSVars {
    color: Color;
    'bg-color': Color;
    'z-index': number;
  }

  class Foo extends Component<{}, {}, {}, CSSVars> {
    override render(): JSX.Element {
      return <Host as="div" style="background-color: var(--bg-color); z-index: var(--z-index);" />;
    }
  }

  const $color = signal<Color>('red'),
    bgColor = 'red';

  render(() => <Foo $var:color={$color} $var:bg-color={bgColor} $var:z-index={20} />, { target });

  expect(target).toMatchSnapshot();

  $color.set('orange');
  tick();

  expect(target).toMatchSnapshot();
});
