import {
  createSSRElement,
  defineElement,
  property,
  type ElementDeclaration,
} from 'maverick.js/element';

it('should render attributes', () => {
  const { ssr } = setupTestElement({
    setup: ({ host }) => {
      host.setAttribute('foo', '1');
      host.setAttribute('bar', '2');
      host.setAttribute('baz', '3');
      host.removeAttribute('baz');
      return () => 'Test';
    },
  });

  expect(ssr()).toMatchSnapshot();
});

it('should render class list', () => {
  const { ssr } = setupTestElement({
    setup: ({ host }) => {
      host.classList.add('foo');
      host.classList.add('baz', 'baz');
      host.classList.toggle('boo');
      host.classList.toggle('bax');
      host.classList.toggle('bax');
      host.classList.toggle('hux');
      host.classList.toggle('hux');
      host.classList.remove('bam');
      return () => 'Test';
    },
  });

  expect(ssr({ class: 'hux bux bam' })).toMatchSnapshot();
});

it('should render styles', () => {
  const { ssr } = setupTestElement({
    setup: ({ host }) => {
      host.style.setProperty('foo', '1');
      host.style.setProperty('bar', '2');
      host.style.setProperty('baz', '3');
      host.style.removeProperty('bzz');
      host.style.setProperty('display', 'content');
      host.style.setProperty('--hux', 'none');
      return () => 'Test';
    },
  });

  expect(ssr({ style: 'display: none; color: white;' })).toMatchSnapshot();
});

it('should reflect props', () => {
  const { ssr } = setupTestElement({
    props: {
      foo: property(10, { reflect: true }),
      bar: property(20, { reflect: true }),
    },
  });

  expect(ssr()).toMatchSnapshot();
});

it('should noop dom events api', () => {
  const { ssr } = setupTestElement({
    setup({ host }) {
      host.addEventListener('click', () => {});
      host.removeEventListener('click', () => {});
      host.dispatchEvent(new MouseEvent('click'));
      return () => null;
    },
  });

  expect(() => ssr()).not.toThrow();
});

let count = 0;
function setupTestElement(definitionInit?: Partial<ElementDeclaration>) {
  const definition = defineElement({
    tagName: `mk-test-${++count}`,
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
    ...definitionInit,
  });

  return {
    definition,
    ssr: createSSRElement(definition),
  };
}
