import {
  createServerElement,
  defineElement,
  defineProp,
  type ElementDeclaration,
} from 'maverick.js/element';

it('should render attributes', () => {
  const { host } = setupTestElement({
    setup: ({ host }) => {
      host.setAttribute('foo', '1');
      host.setAttribute('bar', '2');
      host.setAttribute('baz', '3');
      host.removeAttribute('baz');
      return () => 'Test';
    },
  });

  host.$setup();
  host.$render();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-hydrate" => "",
      "mk-delegate" => "",
      "foo" => "1",
      "bar" => "2",
    }
  `);
});

it('should render class list', () => {
  const { host } = setupTestElement({
    setup: ({ host }) => {
      host.classList.add('foo');
      host.classList.add('baz', 'bam', 'doh');
      host.classList.toggle('boo');
      host.classList.toggle('bax');
      host.classList.toggle('bax');
      host.classList.toggle('hux');
      host.classList.toggle('hux');
      host.classList.remove('bam');
      return () => 'Test';
    },
  });

  host.$setup();
  host.$render();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-hydrate" => "",
      "mk-delegate" => "",
      "class" => "foo baz doh boo",
    }
  `);
});

it('should render styles', () => {
  const { host } = setupTestElement({
    setup: ({ host }) => {
      host.style.setProperty('foo', '1');
      host.style.setProperty('bar', '2');
      host.style.setProperty('baz', '3');
      host.style.removeProperty('baz');
      host.style.setProperty('display', 'content');
      host.style.setProperty('--hux', 'none');
      return () => 'Test';
    },
  });

  host.$setup();
  host.$render();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-hydrate" => "",
      "mk-delegate" => "",
      "style" => "foo: 1;bar: 2;display: content;--hux: none;",
    }
  `);
});

it('should reflect props', () => {
  const { host } = setupTestElement({
    props: {
      foo: defineProp(10, { reflect: true }),
      bar: defineProp(20, { reflect: true }),
    },
  });

  host.$setup();
  host.$render();

  expect(host.attributes.tokens).toMatchInlineSnapshot(`
    Map {
      "mk-hydrate" => "",
      "mk-delegate" => "",
      "foo" => "10",
      "bar" => "20",
    }
  `);
});

it('should noop dom events api', () => {
  const { host } = setupTestElement({
    setup({ host }) {
      host.addEventListener('click', () => {});
      host.removeEventListener('click', () => {});
      host.dispatchEvent(new MouseEvent('click'));
      return null;
    },
  });

  expect(() => {
    host.$setup();
  }).not.toThrow();
});

function setupTestElement(declaration?: Partial<ElementDeclaration>) {
  const definition = defineElement({
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
  });

  return {
    definition,
    host: new (createServerElement(definition))(),
  };
}
