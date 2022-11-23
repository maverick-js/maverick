import { defineProp } from 'maverick.js/element';

it('should set options', () => {
  const prop = defineProp('foo', { attribute: 'bar', reflect: true });
  expect(prop.initial).toEqual('foo');
  expect(prop.attribute).toBe('bar');
  expect(prop.reflect).toBeTruthy();
});

it('should not set options', () => {
  const prop = defineProp('foo');
  expect(prop.initial).toEqual('foo');
  expect(prop.attribute).toBeUndefined();
  expect(prop.reflect).toBeUndefined();
});
