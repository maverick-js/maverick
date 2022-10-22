import { isSubject } from '@maverick-js/observables';
import {
  createSetupProps,
  defineElement,
  getElementDefinition,
  property,
} from 'maverick.js/element';

it('should register element definition', () => {
  const definition = defineElement({
    tagName: 'mk-foo',
    setup: () => () => null,
  });

  expect(getElementDefinition('mk-foo')).toBe(definition);
});

it('should create element definition', () => {
  const definition = defineElement({
    tagName: 'mk-foo',
    props: { apples: property(10) },
    setup: () => () => null,
  });

  expect(definition.tagName).toBe('mk-foo');
  expect(definition.props?.apples.initialValue).toBe(10);
  expect(definition.setup).toBeInstanceOf(Function);
});

it('should create setup props', () => {
  const definition = defineElement({
    tagName: 'mk-foo',
    props: { foo: property(10), bar: property(20) },
    setup: () => () => null,
  });

  const { $props, $setupProps } = createSetupProps(definition.props!);

  expect($props.foo()).toBe(10);
  expect($props.bar()).toBe(20);
  expect(isSubject($props.foo)).toBeTruthy();
  expect(isSubject($props.bar)).toBeTruthy();

  expect($setupProps.foo).toBe(10);
  expect($setupProps.bar).toBe(20);
});
