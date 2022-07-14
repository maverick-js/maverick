import { isObservable, type Observable } from '@maverick-js/observables';

export type Constructor<T = object> = {
  new (...args: any[]): T;
  prototype: T;
};

export type ValueOrObservable<T> = T | Observable<T>;

export function noop(...args: any[]) {}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function isNull(value: any): value is null {
  return value === null;
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function notEqual(valueA: unknown, valueB: unknown): boolean {
  // This ensures (valueB==NaN, valueA==NaN) always returns false.
  return valueB !== valueA && (valueB === valueB || valueA === valueA);
}

export function uppercaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function kebabToTitleCase(str: string) {
  return uppercaseFirstLetter(str.replace(/-./g, (x) => ' ' + x[1].toUpperCase()));
}

export function camelToKebabCase(str: string) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamelCase(str: string) {
  return str.replace(/-./g, (x) => x[1].toUpperCase());
}

export function kebabToPascalCase(str: string) {
  return kebabToTitleCase(str).replace(/\s/g, '');
}

export function camelToTitleCase(str: string) {
  return uppercaseFirstLetter(str.replace(/([A-Z])/g, ' $1'));
}
export function runAll(fns: (() => void)[]) {
  for (const fn of fns) fn();
}

export function run<T>(fn: () => T) {
  return fn();
}

export function raf(
  callback?: () => void,
  cancelHook?: (info: { cancel: () => void }) => void,
): Promise<number> {
  if (__NODE__) {
    callback?.();
    return Promise.resolve(-1);
  }

  return new Promise((resolve) => {
    let cancelled = false;

    const rafId = window.requestAnimationFrame(async () => {
      if (!cancelled) await callback?.();
      resolve(rafId);
    });

    const cancel = () => {
      cancelled = true;
      window?.cancelAnimationFrame(rafId);
    };

    cancelHook?.({ cancel });
  });
}

export function allKeys<T>(...o: T[]): (keyof T)[] {
  return Array.from(new Set(o.map(Object.keys).flat())) as (keyof T)[];
}

export function isCustomEvent(type: string) {
  return type.indexOf('-') === -1;
}

export function unwrapObservable<T>(value: T): T extends Observable<infer R> ? R : T {
  return value && isObservable(value as any) ? (value as any)() : value;
}
