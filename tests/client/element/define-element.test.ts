import { isSubject } from '@maverick-js/observables';

import { defineElement, defineProp, setupElementProps } from 'maverick.js/element';

it('should create element definition', () => {
  const definition = defineElement({
    tagName: 'mk-foo-2',
    props: { apples: defineProp(10) },
  });

  expect(definition.tagName).toBe('mk-foo-2');
  expect(definition.props?.apples.initial).toBe(10);
  expect(definition.setup).toBeInstanceOf(Function);
});

it('should create setup props', () => {
  const definition = defineElement({
    tagName: 'mk-foo-3',
    props: { foo: defineProp(10), bar: defineProp(20) },
  });

  const { $$props, $$setupProps } = setupElementProps(definition.props!);

  expect($$props.foo()).toBe(10);
  expect($$props.bar()).toBe(20);
  expect(isSubject($$props.foo)).toBeTruthy();
  expect(isSubject($$props.bar)).toBeTruthy();

  expect($$setupProps.foo).toBe(10);
  expect($$setupProps.bar).toBe(20);
});
