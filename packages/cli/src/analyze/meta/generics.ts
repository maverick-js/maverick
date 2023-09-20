import type ts from 'typescript';

import { serializeType } from '../utils/types';
import type { ComponentMeta } from './component';

export function buildGenericsMeta(
  checker: ts.TypeChecker,
  props?: ts.Type,
  state?: ts.Type,
  events?: ts.Type,
): ComponentMeta['generics'] {
  const propsGeneric = props ? serializeType(checker, props) : undefined,
    stateGeneric = state ? serializeType(checker, state) : undefined,
    eventsGeneric = events ? serializeType(checker, events) : undefined,
    hasGenerics =
      isValidGeneric(propsGeneric) || isValidGeneric(stateGeneric) || isValidGeneric(eventsGeneric);

  return hasGenerics
    ? {
        props: isValidGeneric(propsGeneric) ? propsGeneric : undefined,
        state: isValidGeneric(stateGeneric) ? stateGeneric : undefined,
        events: isValidGeneric(eventsGeneric) ? eventsGeneric : undefined,
      }
    : undefined;
}

function isValidGeneric(type?: string) {
  return !!type && type !== '{}' && !type.includes(' ');
}
