import { render } from '@maverick-js/dom';
import {
  MaverickComponent,
  type MaverickFunctionProps,
  type ReadSignal,
  signal,
  tick,
} from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('pass props to function component', () => {
  interface Props {
    a: number;
    $b: ReadSignal<number>;
  }

  function Foo({ a, $b }: MaverickFunctionProps<never, Props>) {
    return (
      <div>
        {a}
        {$b}
      </div>
    );
  }

  const $b = signal(20);
  render(() => <Foo a={10} $b={$b} />, { target });

  expect(target).toMatchSnapshot();
});

test('pass props to class component', () => {
  interface Props {
    a: number;
    b: number;
  }

  class Foo extends MaverickComponent<Props> {
    static props: Props = { a: 0, b: 0 };

    override render() {
      const { a, b } = this.$props;
      return (
        <div>
          {a}
          {b}
        </div>
      );
    }
  }

  const $b = signal(10);

  render(() => <Foo a={10} b={$b} />, { target });

  expect(target).toMatchSnapshot();

  $b.set(20);
  tick();

  expect(target).toMatchSnapshot();
});
