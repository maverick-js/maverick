import { METHODS, PROPS } from './internal';

export function prop(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
  if (!target[PROPS]) target[PROPS] = new Set();
  target[PROPS].add(propertyKey);
}

export function method(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
) {
  if (!target[METHODS]) target[METHODS] = new Set();
  target[METHODS].add(propertyKey);
}
