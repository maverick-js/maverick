import { root, createContext } from 'maverick.js';
import { computed } from '@maverick-js/observables';

it('should create context', () => {
  const context = createContext(100);
  expect(context.initial).toEqual(100);

  root(() => {
    expect(context.get()).toEqual(100);

    const $a = computed(() => context.get());
    expect($a()).toEqual(100);

    context.set(200);
    expect(context.get()).toBe(200);
  });
});

it('should forward context across roots', () => {
  const context = createContext(100);
  root(() => {
    context.set(200);
    root(() => {
      expect(context.get()).toEqual(200);
      root(() => {
        expect(context.get()).toEqual(200);
      });
    });
  });
});

it('should throw error when trying to get context outside root', () => {
  expect(() => createContext('').get()).toThrowError(/attempting to get context outside/);
});

it('should throw error when trying to set context outside root', () => {
  expect(() => createContext('').set('')).toThrowError(/attempting to set context outside/);
});
