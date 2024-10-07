import { render } from '@maverick-js/dom';
import { signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('no children', () => {
  render(() => <div />, { target });
  expect(target).toMatchSnapshot();
});

test('text child', () => {
  render(() => <div>Foo</div>, { target });
  expect(target).toMatchSnapshot();
});

test('static child elements', () => {
  render(
    () => (
      <div>
        <span></span>
        <span></span>
      </div>
    ),
    { target },
  );
  expect(target).toMatchSnapshot();
});

test('dynamic child elements', () => {
  const onPointerUp = vi.fn(),
    onPointerDown = vi.fn();

  render(
    () => (
      <div>
        <span on:pointerup={onPointerUp}></span>
        <span on:pointerdown={onPointerDown}></span>
      </div>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();

  const elA = target.firstElementChild!.firstElementChild!,
    elB = elA.nextElementSibling!;

  const eventA = new PointerEvent('pointerup');
  elA.dispatchEvent(eventA);
  expect(onPointerUp).toHaveBeenCalledWith(eventA);

  const eventB = new PointerEvent('pointerdown');
  elB.dispatchEvent(eventB);
  expect(onPointerDown).toHaveBeenCalledWith(eventB);
});

test('static child expression', () => {
  render(() => <div>{'Foo'}</div>, { target });
  expect(target).toMatchSnapshot();
});

test('dynamic child expression', () => {
  const text = 'Foo';
  render(() => <div>{text}</div>, { target });
  expect(target).toMatchSnapshot();
});

test('multiple dynamic child expressions', () => {
  const $showA = signal(true),
    $showB = signal(true),
    onPointerUp = vi.fn(),
    onPointerDown = vi.fn();

  render(
    () => (
      <div>
        {() => ($showA() ? <div on:pointerup={onPointerUp} /> : null)}
        {() => ($showB() ? <span on:pointerdown={onPointerDown} /> : null)}
      </div>
    ),
    { target },
  );

  let elA = target.firstElementChild!.firstElementChild!,
    elB = elA.nextElementSibling!;

  expect(target).toMatchSnapshot();

  const eventA = new PointerEvent('pointerup');
  elA.dispatchEvent(eventA);
  expect(onPointerUp).toHaveBeenCalledWith(eventA);

  const eventB = new PointerEvent('pointerdown');
  elB.dispatchEvent(eventB);
  expect(onPointerDown).toHaveBeenCalledWith(eventB);

  $showA.set(false);
  tick();
  expect(target).toMatchSnapshot();

  $showB.set(false);
  tick();
  expect(target).toMatchSnapshot();

  $showA.set(true);
  tick();
  expect(target).toMatchSnapshot();

  elA = target.firstElementChild!.firstElementChild!;
  const eventA2 = new PointerEvent('pointerup');
  elA.dispatchEvent(eventA2);
  expect(onPointerUp).toHaveBeenCalledWith(eventA2);

  $showB.set(true);
  tick();
  expect(target).toMatchSnapshot();

  elB = elA.nextElementSibling!;
  const eventB2 = new PointerEvent('pointerdown');
  elB.dispatchEvent(eventB2);
  expect(onPointerDown).toHaveBeenCalledWith(eventB2);
});
