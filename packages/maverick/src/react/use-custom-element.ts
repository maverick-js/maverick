import * as React from 'react';

import type { HTMLCustomElement } from '../element/types';

export function useCustomElement<T extends HTMLCustomElement>(
  ref?: T | null | React.RefObject<T | null>,
): T | null {
  const [element, setElement] = React.useState<T | null>(null);

  React.useEffect(() => {
    const el = ref && 'current' in ref ? ref.current : ref;
    if (el) {
      el.onAttach(() => void setElement(el));
      return () => setElement(null);
    } else {
      setElement(null);
    }
  }, [ref]);

  return element;
}
