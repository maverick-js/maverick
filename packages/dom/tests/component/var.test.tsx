import { render } from '@maverick-js/dom';
import { type MaverickFunctionProps, signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('host vars', () => {
  type Color = 'red' | 'orange';

  type Props = MaverickFunctionProps<
    HTMLElement,
    {},
    {},
    {
      color: Color;
      'bg-color': Color;
      'z-index': number;
    }
  >;

  function Foo(props: Props) {
    return <div style="background-color: var(--bg-color); z-index: var(--z-index);"></div>;
  }

  const $color = signal<Color>('red'),
    bgColor = 'red';

  render(() => <Foo $var:color={$color} $var:bg-color={bgColor} $var:z-index={20} />, { target });

  expect(target).toMatchSnapshot();

  $color.set('orange');
  tick();

  expect(target).toMatchSnapshot();
});
