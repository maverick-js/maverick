import type { ElementCSSVarRecord } from './types';

export function defineCSSVar<Value>(value?: Value) {
  return value;
}

export function defineCSSVars<Definition extends ElementCSSVarRecord>(): Definition {
  // type macro which is compiled away.
  return null as any;
}
