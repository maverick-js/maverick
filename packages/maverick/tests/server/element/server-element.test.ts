import {
  Component,
  createComponent,
  createServerElement,
  defineElement,
} from 'maverick.js/element';

it('should call `onAttach` lifecycle hook', () => {
  const attach = vi.fn();

  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    protected override onAttach() {
      attach();
    }
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  expect(attach).toBeCalledTimes(1);
});

it('should render attributes', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    protected override onAttach(el) {
      el.setAttribute('foo', '1');
      el.setAttribute('bar', '2');
      el.setAttribute('baz', '3');
      el.removeAttribute('baz');
    }
    override render() {
      return 'Test';
    }
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "foo" => "1",
      "bar" => "2",
    }
  `);
});

it('should render class list', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
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
    override render() {
      return 'Test';
    }
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "class" => "foo baz doh boo",
    }
  `);
});

it('should render styles', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    protected override onAttach(el) {
      el.style.setProperty('foo', '1');
      el.style.setProperty('bar', '2');
      el.style.setProperty('baz', '3');
      el.style.removeProperty('baz');
      el.style.setProperty('display', 'content');
      el.style.setProperty('--hux', 'none');
    }
    override render() {
      return 'Test';
    }
  }

  const host = new (createServerElement(TestComponent))();
  host.attachComponent(createComponent(TestComponent));

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "style" => "foo: 1;bar: 2;display: content;--hux: none;",
    }
  `);
});

it('should noop dom events api', () => {
  class TestComponent extends Component {
    static el = defineElement({ tagName: `mk-test` });
    protected override onAttach(el) {
      el.addEventListener('click', () => {});
      el.removeEventListener('click', () => {});
    }
  }

  expect(() => {
    const host = new (createServerElement(TestComponent))();
    host.attachComponent(createComponent(TestComponent));
  }).not.toThrow();
});
