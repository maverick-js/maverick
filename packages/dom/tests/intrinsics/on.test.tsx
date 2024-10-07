import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('on', () => {
  const onClick = vi.fn();

  render(() => <div on:click={onClick} />, { target });

  const root = target.firstElementChild!;

  const event = new MouseEvent('click');
  root.dispatchEvent(event);
  expect(onClick).toHaveBeenCalledWith(event);
});

test('capture', () => {
  const onClick = vi.fn();

  render(
    () => (
      <div on_capture:click={onClick}>
        <div on:click={(e) => e.stopImmediatePropagation()} />
      </div>
    ),
    { target },
  );

  const root = target.firstElementChild!;

  const event = new MouseEvent('click');
  root.firstChild!.dispatchEvent(event);
  expect(onClick).toHaveBeenCalledWith(event);
});
