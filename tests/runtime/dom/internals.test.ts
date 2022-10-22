import { observable, root, tick } from 'maverick.js';
import {
  $$_attr,
  $$_class,
  $$_clone,
  $$_create_component,
  $$_create_markers_walker,
  $$_create_template,
  $$_cssvar,
  $$_directive,
  $$_inner_html,
  $$_listen,
  $$_merge_props,
  $$_next_element,
  $$_prop,
  $$_ref,
  $$_spread,
  $$_style,
  insert,
} from 'maverick.js/dom';
import { element, endMarker, startMarker } from './utils';

it('should create template', () => {
  const template = $$_create_template(`<div></div>`);
  expect(template).toBeInstanceOf(DocumentFragment);
  expect(template.firstChild).toBeInstanceOf(HTMLDivElement);
});

it('should create svg template', () => {
  const template = $$_create_template(`<svg></svg>`);
  expect(template).toBeInstanceOf(DocumentFragment);
  expect(template.firstChild).toBeInstanceOf(SVGElement);
});

it('should clone template', () => {
  const template = $$_create_template(`<div></div>`);
  const cloneA = $$_clone(template);
  const cloneB = $$_clone(template);

  expect(cloneA).toBeInstanceOf(DocumentFragment);
  expect(cloneB).toBeInstanceOf(DocumentFragment);

  expect(cloneA!.firstChild).toBeInstanceOf(HTMLDivElement);
  expect(cloneB!.firstChild).toBeInstanceOf(HTMLDivElement);

  expect(cloneA !== cloneB).toBeTruthy();
});

it('should clone element template', () => {
  const template = $$_create_template(`<div></div>`);
  const clone = $$_clone(template, 1);
  expect(clone).toBeInstanceOf(HTMLDivElement);
});

it('should create markers walker', () => {
  const root = element('div');
  const markerA = startMarker();
  const markerB = startMarker();
  const div = element('div');
  const markerC = startMarker();
  div.append(markerC);

  root.append(markerA, element('div'), markerB, endMarker(), endMarker(), div);

  const walker = $$_create_markers_walker(root);
  expect(walker.nextNode()).toBe(markerA);
  expect(walker.nextNode()).toBe(markerB);
  expect(walker.nextNode()).toBe(markerC);
  expect(walker.nextNode()).toBe(null);
});

it('should return next marked element', () => {
  const root = element('div');
  const marker = startMarker();
  const markedElement = element('span');
  root.append(element('div'), marker, markedElement);

  const walker = $$_create_markers_walker(root);
  const nextElement = $$_next_element(walker);
  expect(nextElement).toBe(markedElement);
});

it('should insert string', () => {
  const root = element('div');
  insert(root, 'apples');
  expect(root).toMatchInlineSnapshot(`
    <div>
      apples
    </div>
  `);
  expect(root.firstChild).toBeInstanceOf(Text);
});

it('should insert number', () => {
  const root = element('div');
  insert(root, 100);
  expect(root).toMatchInlineSnapshot(`
    <div>
      100
    </div>
  `);
  expect(root.firstChild).toBeInstanceOf(Text);
});

it('should _not_ insert falsy values', () => {
  const root = element('div');
  insert(root, false);
  insert(root, null);
  insert(root, undefined);
  expect(root).toMatchInlineSnapshot('<div />');
});

it('should insert dom node', () => {
  const root = element('div');
  insert(root, element('span'));
  expect(root).toMatchInlineSnapshot(`
    <div>
      <span />
    </div>
  `);
});

it('should insert dom fragment', () => {
  const root = element('div');

  const fragment = document.createDocumentFragment();
  fragment.append(element('div'));
  fragment.append(element('div'));

  insert(root, fragment);

  expect(root).toMatchInlineSnapshot(`
    <div>
      <div />
      <div />
    </div>
  `);
});

it('should insert observable element', () => {
  const root = element('div');
  const observable = () => element('div');
  insert(root, observable);
  expect(root).toMatchInlineSnapshot(`
    <div>
      <!--$$-->
      <div />
      <!--/$-->
    </div>
  `);
});

it('should insert before given element', () => {
  const root = element('div');
  const before = element('div');
  root.append(element('div'), before);
  insert(root, element('span'), before);
  expect(root).toMatchInlineSnapshot(`
    <div>
      <div />
      <span />
      <div />
    </div>
  `);
});

it('should remove old nodes on update', async () => {
  const root = element('div');
  const $element = observable<any>(element('div'));

  insert(root, $element);
  expect(root).toMatchInlineSnapshot(`
    <div>
      <!--$$-->
      <div />
      <!--/$-->
    </div>
  `);

  const newFragment = document.createDocumentFragment();
  newFragment.append(element('span'), element('span'), element('span'));

  $element.set(newFragment);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <div>
      <!--$$-->
      <span />
      <span />
      <span />
      <!--/$-->
    </div>
  `);

  $element.set(null);
  await tick();
  expect(root).toMatchInlineSnapshot(`
    <div>
      <!--$$-->
      <!--/$-->
    </div>
  `);
});

it('should create component', () => {
  function Component() {
    return element('div');
  }

  expect($$_create_component(Component)).toBeInstanceOf(HTMLDivElement);
});

it('should invoke ref', () => {
  const el = element('div');
  const ref = vi.fn();
  $$_ref(el, ref);
  expect(ref).toHaveBeenCalledWith(el);
  expect(ref).toHaveBeenCalledTimes(1);
});

it('should invoke ref (array)', () => {
  const el = element('div');
  const refs = [vi.fn(), vi.fn(), vi.fn()];

  $$_ref(el, refs);

  refs.forEach((ref) => {
    expect(ref).toHaveBeenCalledWith(el);
    expect(ref).toHaveBeenCalledTimes(1);
  });
});

it('should invoke directive', () => {
  const el = element('div');
  const directive = vi.fn();
  $$_directive(el, directive, [1, 2, 3]);
  expect(directive).toHaveBeenCalledWith(el, 1, 2, 3);
});

it('should set attribute', () => {
  const el = element('div');
  $$_attr(el, 'foo', 'bar');
  expect(el.getAttribute('foo')).toBe('bar');
});

it('should remove falsy attribute', () => {
  const el = element('div');
  $$_attr(el, 'foo', 'bar');
  $$_attr(el, 'foo', null);
  expect(el.getAttribute('foo')).toBe(null);
});

it('should observe attribute', async () => {
  const el = element('div');
  const $attr = observable<string | undefined>('foo');

  $$_attr(el, 'foo', $attr);
  expect(el.getAttribute('foo')).toBe('foo');

  $attr.set(undefined);
  await tick();
  expect(el.getAttribute('foo')).toBe(null);

  $attr.set('bar');
  await tick();
  expect(el.getAttribute('foo')).toBe('bar');
});

it('should set property', () => {
  const el = element('div');
  $$_prop(el, 'tabIndex', 1);
  expect(el.tabIndex).toBe(1);
});

it('should observe property', async () => {
  const el = element('div');
  const $prop = observable(10);

  $$_prop(el, 'tabIndex', $prop);
  expect(el.tabIndex).toBe(10);

  $prop.set(20);
  await tick();
  expect(el.tabIndex).toBe(20);
});

it('should set inner html', () => {
  const el = element('div');
  $$_inner_html(el, 'foo');
  expect(el.innerHTML).toBe('foo');
});

it('set class', () => {
  const el = element('div');
  $$_class(el, 'foo', true);
  expect(el.classList.contains('foo')).toBeTruthy();
});

it('remove falsy class', () => {
  const el = element('div');
  $$_class(el, 'foo', true);
  $$_class(el, 'foo', null);
  expect(el.classList.contains('foo')).toBeFalsy();
});

it('set style', () => {
  const el = element('div');
  $$_style(el, 'text-align', 'center');
  expect(el.style.textAlign).toBe('center');
});

it('remove falsy style', () => {
  const el = element('div');
  $$_style(el, 'text-align', 'center');
  $$_style(el, 'text-align', null);
  expect(el.style.textAlign).toBe('');
});

it('set cssvar', () => {
  const el = element('div');
  $$_cssvar(el, 'foo', 'bar');
  expect(el.style.getPropertyValue('--foo')).toBe('bar');
});

it('remove falsy cssvar', () => {
  const el = element('div');
  $$_cssvar(el, 'foo', 'bar');
  $$_cssvar(el, 'foo', null);
  expect(el.style.getPropertyValue('--foo')).toBe('');
});

it('should spread', () => {
  const el = element('div');
  const props = { tabIndex: 10, foo: 'bar', baz: 20 };
  $$_spread(el, props);
  expect(el.tabIndex).toEqual(10);
  expect(el.getAttribute('tabindex')).toBe('10');
  expect(el.getAttribute('foo')).toBe('bar');
  expect(el.getAttribute('baz')).toBe('20');
});

it('should merge props', () => {
  const propsA = {
    get foo() {
      return 10;
    },
    bar: 10,
  };

  const propsB = {
    get baz() {
      return 20;
    },
    bar: 30,
  };

  const merged = $$_merge_props(propsA, propsB) as any;
  expect(merged.foo).toBe(10);
  expect(merged.baz).toBe(20);
  expect(merged.bar).toBe(30);
});

it('should set listener', () => {
  const el = element('div');
  const handler = vi.fn();
  const event = new MouseEvent('click');

  const dispose = root((dispose) => {
    $$_listen(el, 'click', handler);
    return dispose;
  });

  el.dispatchEvent(event);
  expect(handler).toHaveBeenCalledWith(event);

  dispose();
  el.dispatchEvent(new MouseEvent('click'));
  expect(handler).toHaveBeenCalledTimes(1);
});

it('should set listener (capture)', () => {
  const el = element('div');
  const handler = vi.fn();
  const event = new MouseEvent('click');

  $$_listen(el, 'click', handler, true);
  el.addEventListener('click', (e) => e.stopImmediatePropagation(), { capture: true });

  el.dispatchEvent(new MouseEvent('click'));
  expect(handler).toHaveBeenCalledWith(event);
  expect(handler).toHaveBeenCalledTimes(1);
});
