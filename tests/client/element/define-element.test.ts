import { defineElement, defineProp } from 'maverick.js/element';

it('should create element definition', () => {
  const definition = defineElement({
    tagName: 'mk-foo-2',
    props: { apples: defineProp(10) },
  });

  expect(definition.tagName).toBe('mk-foo-2');
  expect(definition.props?.apples.initial).toBe(10);
  expect(definition.setup).toBeInstanceOf(Function);
});
