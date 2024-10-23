import {
  computedKeyedMap,
  computedMap,
  type ForKeyedProps,
  type ForProps,
  getSlots,
} from '@maverick-js/core';
import { unwrap } from '@maverick-js/std';

export function For<Item = unknown>({ each }: ForProps<Item>) {
  const slots = getSlots();
  return slots.default ? computedMap(() => unwrap(each), slots.default) : null;
}

export function ForKeyed<Item = unknown>({ each }: ForKeyedProps<Item>) {
  const slots = getSlots();
  return slots.default ? computedKeyedMap(() => unwrap(each), slots.default) : null;
}
