import { getSlots, signal, tick } from '@maverick-js/core';
import { hydrate } from '@maverick-js/dom';

import { el, mark, text } from './utils';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('hydrate', () => {
  const spanOne = el('span');
  const countTextTwo = text('1');
  spanOne.append(mark(), countTextTwo);

  const spanTwo = el('span');
  const countTextThree = text('1');
  spanTwo.append(mark(), countTextThree);

  const div = el('div');
  const countIsText = text('Count is');
  const countText = text('1');

  div.append(countIsText, mark(), countText, mark() /** <Foo> */, mark(), spanOne, mark(), spanTwo);

  target.append(mark(), div);

  expect(target).toMatchSnapshot();

  const $count = signal(1),
    onClick = vi.fn();

  function Child(props) {
    const slots = getSlots();
    return slots.default?.();
  }

  function Foo() {
    return (
      <div on:click={onClick}>
        Count is {$count}
        <Child>
          <span>{$count}</span>
          <span>{$count}</span>
        </Child>
      </div>
    );
  }

  hydrate(() => <Foo />, { target });

  expect(target).toMatchSnapshot();

  const a = target.querySelector('div')!;
  expect(a).toBe(div);
  expect(a?.firstChild).toBe(countIsText);
  expect(a?.firstChild?.nextSibling).toBeInstanceOf(Comment);
  expect(a?.firstChild?.nextSibling?.nextSibling).toBe(countText);

  const b = target.querySelector('span:first-child')!;
  expect(b).toBe(spanOne);
  expect(b?.firstChild).toBeInstanceOf(Comment);
  expect(b?.firstChild?.nextSibling).toBe(countTextTwo);

  const c = target.querySelector('span:nth-child(2)')!;
  expect(c).toBe(spanTwo);
  expect(c?.firstChild).toBeInstanceOf(Comment);
  expect(c?.firstChild?.nextSibling).toBe(countTextThree);

  const clickEvent = new MouseEvent('click');
  a.dispatchEvent(clickEvent);
  expect(onClick).toHaveBeenCalledWith(clickEvent);

  $count.set(2);
  tick();

  expect(countText.textContent).toBe('2');
  expect(countTextTwo.textContent).toBe('2');
  expect(countTextThree.textContent).toBe('2');
  expect(target).toMatchSnapshot();
});
