import {
  createContext,
  hasProvidedContext,
  provideContext,
  root,
  useContext,
} from '@maverick-js/core';
import { computed } from '@maverick-js/signals';

it('should create context', () => {
  const FooContext = createContext(() => 1);
  expect(FooContext.provide!()).toEqual(1);

  root(() => {
    provideContext(FooContext);

    expect(useContext(FooContext)).toEqual(1);

    const $a = computed(() => useContext(FooContext));
    expect($a()).toEqual(1);

    provideContext(FooContext, 2);
    expect(useContext(FooContext)).toBe(2);
  });
});

it('should forward context across roots', () => {
  const FooContext = createContext(() => 1);
  root(() => {
    provideContext(FooContext, 2);
    root(() => {
      expect(useContext(FooContext)).toEqual(2);
      root(() => {
        expect(useContext(FooContext)).toEqual(2);
      });
    });
  });
});

it('should return true if context has been provided', () => {
  const FooContext = createContext(() => 1);
  root(() => {
    provideContext(FooContext);
    expect(hasProvidedContext(FooContext)).toBeTruthy();
  });
});

it('should return false if context has _not_ been provided', () => {
  const FooContext = createContext(() => 1);
  expect(hasProvidedContext(FooContext)).toBeFalsy();
});

it('should throw error when trying to provide context outside root', () => {
  expect(() => provideContext(createContext(() => 0))).toThrowError(
    /attempting to provide context outside/,
  );
});

it('should throw error when trying to provide context without initial value', () => {
  expect(() => root(() => provideContext(createContext()))).toThrowError(
    /context can not be provided without a value or/,
  );
});

it('should throw error when trying to use context before providing', () => {
  expect(() => root(() => useContext(createContext()))).toThrowError(
    /attempting to use context without providing first/,
  );
});
