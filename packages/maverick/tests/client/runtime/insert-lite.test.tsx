import { signal, tick } from '@maverick-js/signals';

import { insertLite } from 'maverick.js/dom/insert-lite';

it('should insert string', () => {
  const root = document.createElement('root');
  insertLite(root, 'Foo');
  expect(root).toMatchInlineSnapshot(`
    <root>
      Foo
    </root>
  `);
});

it('should insert before', () => {
  const root = document.createElement('root');
  const firstChild = document.createElement('div');
  root.appendChild(firstChild);
  insertLite(root, 'Foo', firstChild);
  expect(root).toMatchInlineSnapshot(`
    <root>
      Foo
      <div />
    </root>
  `);
});

it('should insert number', () => {
  const root = document.createElement('root');
  insertLite(root, 100);
  expect(root).toMatchInlineSnapshot(`
    <root>
      100
    </root>
  `);
});

it('should _not_ insert falsy values', () => {
  const root = document.createElement('root');
  insertLite(root, false);
  insertLite(root, null);
  insertLite(root, undefined);
  expect(root).toMatchInlineSnapshot('<root />');
});

it('should insert array', () => {
  const root = document.createElement('root');
  insertLite(root, ['Foo', 100, document.createElement('div'), () => 100]);
  expect(root).toMatchInlineSnapshot(`
    <root>
      Foo
      100
      <div />
      <!--$$-->
      100
      <!--/$-->
    </root>
  `);
});

it('should update signal string', () => {
  const root = document.createElement('root');
  const $text = signal<string | null>('foo');
  insertLite(root, $text);
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      foo
      <!--/$-->
    </root>
  `);
  $text.set('bar');
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      bar
      <!--/$-->
    </root>
  `);
  $text.set(null);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <!--/$-->
    </root>
  `);
});

it('should update dom node', () => {
  const root = document.createElement('root');
  const $el = signal<HTMLElement | null>(document.createElement('div'));
  insertLite(root, $el);
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div />
      <!--/$-->
    </root>
  `);
  $el.set(document.createElement('span'));
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <span />
      <!--/$-->
    </root>
  `);
  $el.set(null);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <!--/$-->
    </root>
  `);
});

it('should update array', () => {
  const root = document.createElement('root');
  const $el = signal<any[] | null>([document.createElement('div'), 'Foo', 100]);
  insertLite(root, $el);
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <div />
      Foo
      100
      <!--/$-->
    </root>
  `);
  $el.set(['Foo', 100]);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      Foo
      100
      <!--/$-->
    </root>
  `);
  $el.set(null);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      <!--/$-->
    </root>
  `);
  $el.set([0, 1, null, 2, false, [3, 4, 5], 6, undefined, [7, 8, 9], 10]);
  tick();
  expect(root).toMatchInlineSnapshot(`
    <root>
      <!--$$-->
      0
      1
      2
      3
      4
      5
      6
      7
      8
      9
      10
      <!--/$-->
    </root>
  `);
});
