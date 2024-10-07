import { render } from '@maverick-js/dom';
import {
  createSlot,
  Fragment,
  type FunctionComponentProps,
  getSlots,
  type ReadSignal,
  signal,
  type Slot,
  tick,
} from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('text', () => {
  function Foo(props: FunctionComponentProps) {
    const slots = getSlots();
    return slots.default?.();
  }

  render(() => <Foo>Hello World!</Foo>, { target });

  expect(target).toMatchSnapshot();
});

test('single static element in default slot', () => {
  function Foo(props: FunctionComponentProps) {
    const slots = getSlots();
    return slots.default?.();
  }

  render(
    () => (
      <Foo>
        <div />
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('single static element in named slot', () => {
  function Foo(props: FunctionComponentProps) {
    const slots = getSlots<{ named: Slot }>();
    return slots.named?.();
  }

  render(
    () => (
      <Foo>
        <div slot="named" />
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('multiple static elements in named slot', () => {
  function Foo(props: FunctionComponentProps) {
    const slots = getSlots<{ named: Slot }>();
    return slots.named?.();
  }

  render(
    () => (
      <Foo>
        <Fragment slot="named">
          <div />
          <div />
        </Fragment>
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('dynamic elements', () => {
  const onClick = vi.fn();

  function Foo(props: FunctionComponentProps) {
    const slots = getSlots();
    return slots.default?.();
  }

  render(
    () => (
      <Foo>
        <div on:click={onClick} />
        <div on:click={onClick} />
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();

  const elA = target.firstElementChild!,
    elB = elA.nextElementSibling!;

  const clickEvent = new MouseEvent('click');

  elA.dispatchEvent(clickEvent);
  expect(onClick).toHaveBeenCalledWith(clickEvent);

  elB.dispatchEvent(clickEvent);
  expect(onClick).toHaveBeenCalledTimes(2);
});

test('namespaced slot', () => {
  interface Slots {
    default: Slot;
    named: Slot;
  }

  function Foo(props: FunctionComponentProps) {
    const slots = getSlots<Slots>();
    return [slots.default(), slots.named()];
  }

  Foo.Slot = createSlot<Slots>();

  render(
    () => (
      <Foo>
        <Foo.Slot>
          <div />
          <div />
        </Foo.Slot>
        <Foo.Slot name="named">
          <span />
          <span />
        </Foo.Slot>
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('render function', () => {
  interface Slots {
    default: Slot<{ a: number; b: number; $c: ReadSignal<number> }>;
  }

  const $c = signal(0);

  function Foo(props: FunctionComponentProps) {
    const slots = getSlots<Slots>();
    return <div>{slots.default({ a: 10, b: 20, $c })}</div>;
  }

  render(
    () => (
      <Foo>
        {({ a, b, $c }) => (
          <span>
            {a} - {b} - {$c}
          </span>
        )}
      </Foo>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();

  $c.set(30);
  tick();

  expect(target).toMatchSnapshot();
});
