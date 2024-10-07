import { render } from '@maverick-js/dom';
import { createEventTarget, type FunctionComponentProps, Host, signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('<Host>', () => {
  const onClick = vi.fn();

  render(
    () => (
      <Host class="foo" as="div" data-foo class:bar var:foo={10} on:click={onClick}>
        <span>Contents</span>
      </Host>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();

  const el = target.firstElementChild!;

  const event = new MouseEvent('click');
  el.dispatchEvent(event);
  expect(onClick).toHaveBeenCalledWith(event);
});

test('attach to host', () => {
  const $foo = signal(10),
    onClick = vi.fn(),
    ref = vi.fn();

  function Foo(props: FunctionComponentProps<HTMLElement, {}, { click: MouseEvent }>) {
    createEventTarget();
    return (
      <Host class="foo" on:click as="div">
        <span>Contents</span>
      </Host>
    );
  }

  render(
    () => <Foo class="bar" data-foo class:hux $var:foo={$foo} on:click={onClick} ref={ref} />,
    { target },
  );

  expect(target).toMatchSnapshot();

  $foo.set(20);
  tick();

  expect(target).toMatchSnapshot();

  const el = target.firstElementChild!;

  const clickEvent = new MouseEvent('click');
  el.dispatchEvent(clickEvent);

  const onClickArg = onClick.mock.calls[0][0];
  expect(onClickArg.target).toBe(clickEvent.target);
  expect(onClickArg.currentTarget).toBe(clickEvent.currentTarget);

  expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
});
