import { getSlots, type InternalHostProps } from '@maverick-js/core';

import { $$_attr, $$_signal_name_re } from '../runtime';

export function Host({ $$host, ...attrs }: InternalHostProps) {
  const slots = getSlots();

  for (const name of Object.keys(attrs)) {
    $$_attr($$host, name.replace($$_signal_name_re, ''), attrs[name]);
  }

  return slots.default?.();
}
