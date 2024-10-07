import { render } from '@maverick-js/dom';
import { Fragment, signal, tick } from 'maverick.js';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('no children', () => {
  render(() => <></>, { target });
  expect(target).toMatchSnapshot();
});

test('one static child', () => {
  render(
    () => (
      <>
        <div />
      </>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('multiple static child elements', () => {
  render(
    () => (
      <>
        <div />
        <span />
      </>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('one dynamic child element', () => {
  const onClick = vi.fn();

  render(
    () => (
      <>
        <div on:click={onClick} />
      </>
    ),
    { target },
  );

  expect(target.childElementCount).toBe(1);

  const root = target.firstElementChild!;

  const event = new PointerEvent('click');
  root.dispatchEvent(event);
  expect(onClick).toHaveBeenCalledWith(event);
});

test('multiple dynamic child elements', () => {
  const onPointerUp = vi.fn(),
    onPointerDown = vi.fn();

  render(
    () => (
      <>
        <div on:pointerup={onPointerUp} />
        <div on:pointerdown={onPointerDown} />
      </>
    ),
    { target },
  );

  expect(target.childElementCount).toBe(2);

  const elA = target.firstElementChild!,
    elB = elA.nextElementSibling!;

  const eventA = new PointerEvent('pointerup');
  elA.dispatchEvent(eventA);
  expect(onPointerUp).toBeCalledWith(eventA);

  const eventB = new PointerEvent('pointerdown');
  elB.dispatchEvent(eventB);
  expect(onPointerDown).toBeCalledWith(eventB);
});

test('one static child expression', () => {
  render(() => <>{'foo'}</>, { target });
  expect(target).toMatchSnapshot();
});

test('one dynamic child expression', () => {
  const content = 'foo';
  render(() => <>{content}</>, { target });
  expect(target).toMatchSnapshot();
});

test('multiple dynamic child expressions', () => {
  const $showA = signal(true),
    $showB = signal(true),
    onPointerUp = vi.fn(),
    onPointerDown = vi.fn();

  render(
    () => (
      <>
        {() => ($showA() ? <div on:pointerup={onPointerUp} /> : null)}
        {() => ($showB() ? <span on:pointerdown={onPointerDown} /> : null)}
      </>
    ),
    { target },
  );

  const elA = target.firstElementChild!,
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
});

test('<Fragment>', () => {
  render(
    () => (
      <Fragment>
        <div></div>
        <span></span>
      </Fragment>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});
