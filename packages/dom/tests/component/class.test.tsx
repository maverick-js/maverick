import { Component, Host, type JSX, signal, tick } from '@maverick-js/core';
import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('host vars', () => {
  class Foo extends Component {
    override render(): JSX.Element {
      return <Host as="div" class="foo"></Host>;
    }
  }

  const $bar = signal(true),
    bux = false;

  render(() => <Foo $class:bar={$bar} class:bux={bux} />, { target });

  expect(target).toMatchSnapshot();

  $bar.set(false);
  tick();

  expect(target).toMatchSnapshot();
});
