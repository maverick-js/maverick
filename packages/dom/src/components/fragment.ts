import { getSlots } from 'maverick.js';

export function Fragment() {
  const slots = getSlots();
  return slots.default?.();
}
