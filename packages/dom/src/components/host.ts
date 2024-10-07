import { getSlots, type HostProps } from 'maverick.js';

import { insert } from '../insert';
import {
  $$_attr,
  $$_current_host_element,
  $$_rendering_custom_element,
  $$_signal_name_re,
} from '../runtime';

export function Host({ as, ...attrs }: HostProps) {
  const host = $$_current_host_element ?? document.createElement(as),
    slots = getSlots();

  for (const name of Object.keys(attrs)) {
    $$_attr(host, name.replace($$_signal_name_re, ''), attrs[name]);
  }

  if ($$_rendering_custom_element) {
    return slots.default?.();
  } else {
    if (slots.default) insert(host, slots.default());
    return host;
  }
}
