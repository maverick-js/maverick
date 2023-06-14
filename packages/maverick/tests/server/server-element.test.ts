import { Component, createComponent } from 'maverick.js';

import { MaverickServerElement } from 'maverick.js/element/server';

it('should call `onAttach` lifecycle hook', () => {
  const attach = vi.fn();

  class TestComponent extends Component {
    protected override onAttach() {
      attach();
    }
  }

  const host = new MaverickServerElement(createComponent(TestComponent));
  host.attach();
  host.destroy();

  expect(attach).toBeCalledTimes(1);
});

it('should render attributes', () => {
  class TestComponent extends Component {
    protected override onAttach(el) {
      el.setAttribute('foo', '1');
      el.setAttribute('bar', '2');
      el.setAttribute('baz', '3');
      el.removeAttribute('baz');
    }
  }

  const host = new MaverickServerElement(createComponent(TestComponent));
  host.attach();
  host.destroy();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "foo" => "1",
      "bar" => "2",
    }
  `);
});

it('should render class list', () => {
  class TestComponent extends Component {
    protected override onAttach(el) {
      el.classList.add('foo');
      el.classList.add('baz', 'bam', 'doh');
      el.classList.toggle('boo');
      el.classList.toggle('bax');
      el.classList.toggle('bax');
      el.classList.toggle('hux');
      el.classList.toggle('hux');
      el.classList.remove('bam');
    }
  }

  const host = new MaverickServerElement(createComponent(TestComponent));
  host.attach();
  host.destroy();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "class" => "foo baz doh boo",
    }
  `);
});

it('should render styles', () => {
  class TestComponent extends Component {
    protected override onAttach(el) {
      el.style.setProperty('foo', '1');
      el.style.setProperty('bar', '2');
      el.style.setProperty('baz', '3');
      el.style.removeProperty('baz');
      el.style.setProperty('display', 'content');
      el.style.setProperty('--hux', 'none');
    }
  }

  const host = new MaverickServerElement(createComponent(TestComponent));
  host.attach();
  host.destroy();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "style" => "foo: 1;bar: 2;display: content;--hux: none;",
    }
  `);
});

it('should noop dom events api', () => {
  class TestComponent extends Component {
    protected override onAttach(el) {
      el.addEventListener('click', () => {});
      el.removeEventListener('click', () => {});
    }
  }

  expect(() => {
    const host = new MaverickServerElement(createComponent(TestComponent));
    host.attach();
    host.destroy();
  }).not.toThrow();
});
