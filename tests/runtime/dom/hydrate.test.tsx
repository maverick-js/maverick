import type { ParentComponent } from '@maverick-js/elements';
import { hydrate } from '@maverick-js/elements/dom';
import { $observable, $tick } from '@maverick-js/observables';
import { element, startMarker, text } from './utils';

it('should hydrate', async () => {
  const root = element('root');

  const span = element('span');
  const countTextTwo = text('1');
  span.append(startMarker(), countTextTwo);

  const div = element('div');
  const countIsText = text('Count is');
  const countText = text('1');
  div.append(countIsText, startMarker(), countText, startMarker(), span);
  root.append(startMarker(), div);

  const $count = $observable(1);
  const clickHandler = vi.fn();

  const ChildComponent: ParentComponent = (props) => {
    return props.children;
  };

  function Component() {
    return (
      <div $on:click={clickHandler}>
        Count is {$count()}
        <ChildComponent>
          <span>{$count()}</span>
        </ChildComponent>
      </div>
    );
  }

  hydrate(() => <Component />, { target: root });

  expect(root).toMatchSnapshot();

  const a = root.firstElementChild;
  expect(a).toBe(div);
  const b = a?.firstChild;
  expect(b).toBe(countIsText);
  const c = b?.nextSibling?.nextSibling;
  expect(c).toBe(countText);
  const d = c?.nextSibling?.nextSibling?.nextSibling;
  expect(d).toBe(span);
  const e = d?.nextSibling;
  expect(e).toBe(null);
  const f = d?.firstChild?.nextSibling;
  expect(f).toBe(countTextTwo);
  const g = f?.nextSibling?.nextSibling;
  expect(g).toBe(null);

  const clickEvent = new MouseEvent('click');
  div.dispatchEvent(clickEvent);
  expect(clickHandler).toHaveBeenCalledWith(clickEvent);

  $count.set(2);
  await $tick();

  expect(countText.textContent).toBe('2');
  expect(countTextTwo.textContent).toBe('2');
  expect(root).toMatchSnapshot();
});
