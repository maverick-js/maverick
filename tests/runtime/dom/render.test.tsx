import { render } from '@maverick-js/elements/dom';
import { $tick } from '@maverick-js/observables';
import { Element, Fragment } from './fixtures/primitives';
import { InputField } from './fixtures/reactivity';
import { element } from './utils';

it('should render element', () => {
  const root = element('root');
  render(() => <Element />, { target: root });
  expect(root).toMatchSnapshot();
  expect(root.firstElementChild).toBeInstanceOf(HTMLDivElement);
  expect(<Element />).toBeInstanceOf(HTMLDivElement);
});

it('should render fragment', () => {
  const root = element('root');
  render(() => <Fragment />, { target: root });
  expect(root).toMatchSnapshot();
  expect(<Fragment />).toBeInstanceOf(DocumentFragment);
});

it('should be reactive', async () => {
  const root = element('root');

  let next!: () => void;
  const input = <InputField next={(n) => (next = n)} />;

  render(() => input, { target: root });

  await $tick();
  expect(root).toMatchSnapshot();

  const getValueTextNode = () => root.querySelector('span')!.childNodes[2];
  const valueText = getValueTextNode();
  expect(valueText).toBeInstanceOf(Text);

  const inputElement = root.querySelector('input');
  expect(inputElement).toBeInstanceOf(HTMLInputElement);

  next();
  await $tick();
  expect(root).toMatchSnapshot();

  // it should re-use existing node.
  expect(getValueTextNode()).toBe(valueText);

  inputElement!.dispatchEvent(new CustomEvent('next'));
  await $tick();
  expect(root).toMatchSnapshot();
});
