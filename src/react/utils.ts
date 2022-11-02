import * as React from 'react';

import { type ContextMap } from '../runtime';
import { ReactElementContextMap } from './react-element-context';

export function WithContextMap(
  contextMap: ContextMap,
  providedContextMap: ContextMap | null,
  customElement: React.ReactElement,
) {
  return providedContextMap
    ? customElement
    : React.createElement(ReactElementContextMap.Provider, { value: contextMap }, customElement);
}

export function setRef(ref: React.Ref<unknown>, value: Element | null) {
  if (typeof ref === 'function') {
    (ref as (e: Element | null) => void)(value);
  } else {
    (ref as { current: Element | null }).current = value;
  }
}
