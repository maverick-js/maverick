import { computed } from '@maverick-js/observables';
import { createContext, root } from 'maverick.js';

it('should create context', () => {
  const context = createContext(1);
  expect(context.initial).toEqual(1);

  root(() => {
    expect(context()).toEqual(1);

    const $a = computed(() => context());
    expect($a()).toEqual(1);

    context.set(2);
    expect(context()).toBe(2);

    context.next((n) => n + 1);
    expect(context()).toBe(3);
  });
});

it('should forward context across roots', () => {
  const context = createContext(1);
  root(() => {
    context.set(2);
    root(() => {
      expect(context()).toEqual(2);
      root(() => {
        expect(context()).toEqual(2);
      });
    });
  });
});

it('should throw error when trying to get context outside root', () => {
  expect(() => createContext(0)()).toThrowError(/attempting to get context outside/);
});

it('should throw error when trying to set context outside root', () => {
  expect(() => createContext(0).set(1)).toThrowError(/attempting to set context outside/);
});
