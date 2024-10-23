import { getSlots } from '@maverick-js/core';

export function Fragment() {
  const slots = getSlots();
  return slots.default?.();
}
