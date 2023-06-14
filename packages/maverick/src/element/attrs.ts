import type { SignalOptions } from '@maverick-js/signals';

import { isArray } from '../std/unit';

export type AttributeValue = string | null;

export type Attributes<Props> = {
  [P in keyof Props]?: string | false | Attribute<Props[P]>;
};

export interface AttributeConverter<Value = unknown> {
  (value: AttributeValue): Value;
}

export interface Attribute<Value = unknown> extends SignalOptions<Value> {
  /**
   * Whether the property is associated with an attribute, or a custom name for the associated
   * attribute. By default this is `true` and the attribute name is inferred by kebab-casing the
   * property name.
   */
  attr?: string | false;
  /**
   * Convert between an attribute value and property value. If not specified it will be inferred
   * from the initial value.
   */
  converter?: AttributeConverter<Value>;
}

export const STRING: AttributeConverter<string | null> = (v) => (v === null ? '' : v + '');
export const NUMBER: AttributeConverter<number | null> = (v) => (v === null ? 0 : Number(v));
export const BOOLEAN: AttributeConverter<boolean | null> = (v) => v !== null;
export const FUNCTION: AttributeConverter<(() => void) | null> = () => null;
export const ARRAY: AttributeConverter<unknown[] | null> = (v) => (v === null ? [] : JSON.parse(v));
export const OBJECT: AttributeConverter<object | null> = (v) => (v === null ? {} : JSON.parse(v));

export function inferAttributeConverter(value: unknown): AttributeConverter<any> {
  if (value === null) return STRING;
  switch (typeof value) {
    case 'undefined':
      return STRING;
    case 'string':
      return STRING;
    case 'boolean':
      return BOOLEAN;
    case 'number':
      return NUMBER;
    case 'function':
      return FUNCTION;
    case 'object':
      return isArray(value) ? ARRAY : OBJECT;
    default:
      return STRING;
  }
}
