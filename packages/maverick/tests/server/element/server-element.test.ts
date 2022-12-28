import {
  createElementInstance,
  createServerElement,
  CustomElementDeclaration,
  defineCustomElement,
  onAttach,
} from 'maverick.js/element';

it('should call `onAttach` lifecycle hook', () => {
  const attach = vi.fn();

  const { instance, host } = setupTestElement({
    setup: () => {
      onAttach(attach);
      return () => null;
    },
  });

  host.attachComponent(instance);
  expect(attach).toBeCalledTimes(1);
});

it('should render attributes', () => {
  const { instance, host } = setupTestElement({
    setup: ({ host }) => {
      onAttach(() => {
        host.el!.setAttribute('foo', '1');
        host.el!.setAttribute('bar', '2');
        host.el!.setAttribute('baz', '3');
        host.el!.removeAttribute('baz');
      });

      return () => 'Test';
    },
  });

  host.attachComponent(instance);

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
  const { instance, host } = setupTestElement({
    setup: ({ host }) => {
      onAttach(() => {
        host.el!.classList.add('foo');
        host.el!.classList.add('baz', 'bam', 'doh');
        host.el!.classList.toggle('boo');
        host.el!.classList.toggle('bax');
        host.el!.classList.toggle('bax');
        host.el!.classList.toggle('hux');
        host.el!.classList.toggle('hux');
        host.el!.classList.remove('bam');
      });
      return () => 'Test';
    },
  });

  host.attachComponent(instance);

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "class" => "foo baz doh boo",
    }
  `);
});

it('should render styles', () => {
  const { instance, host } = setupTestElement({
    setup: ({ host }) => {
      onAttach(() => {
        host.el!.style.setProperty('foo', '1');
        host.el!.style.setProperty('bar', '2');
        host.el!.style.setProperty('baz', '3');
        host.el!.style.removeProperty('baz');
        host.el!.style.setProperty('display', 'content');
        host.el!.style.setProperty('--hux', 'none');
      });

      return () => 'Test';
    },
  });

  host.attachComponent(instance);

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "style" => "foo: 1;bar: 2;display: content;--hux: none;",
    }
  `);
});

it('should reflect props', () => {
  const { instance, host } = setupTestElement({
    props: {
      foo: { initial: 10, reflect: true },
      bar: { initial: 20, reflect: true },
    },
  });

  host.attachComponent(instance);

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-h" => "",
      "mk-d" => "",
      "foo" => "10",
      "bar" => "20",
    }
  `);
});

it('should noop dom events api', () => {
  const { instance, host } = setupTestElement({
    setup({ host }) {
      onAttach(() => {
        host.el!.addEventListener('click', () => {});
        host.el!.removeEventListener('click', () => {});
      });

      return () => null;
    },
  });

  expect(() => {
    host.attachComponent(instance);
  }).not.toThrow();
});

function setupTestElement(declaration?: Partial<CustomElementDeclaration>) {
  const definition = defineCustomElement({
    tagName: `mk-foo`,
    setup: ({ props }) => {
      const members = { $render: () => 'Test' };

      for (const prop of Object.keys(props)) {
        Object.defineProperty(members, prop, {
          enumerable: true,
          get() {
            return props[prop];
          },
        });
      }

      return members;
    },
    ...declaration,
  } as any);

  const instance = createElementInstance(definition);

  return {
    definition,
    instance,
    host: new (createServerElement(definition))(),
  };
}
