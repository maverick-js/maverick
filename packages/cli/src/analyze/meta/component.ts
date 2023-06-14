import type ts from 'typescript';

export const TS_NODE = Symbol('NODE');

export type TypeMeta = string;

export interface PropMeta {
  [TS_NODE]: ts.Node;
  name: string;
  type: TypeMeta;
  default?: string;
  docs?: string;
  doctags?: DocTagMeta[];
  required?: boolean;
  readonly?: boolean;
  internal?: boolean;
  deprecated?: boolean;
}

export interface ParameterMeta {
  [TS_NODE]?: ts.Node;
  name: string;
  type: TypeMeta;
  default?: string;
  optional?: boolean;
}

export interface MethodMeta {
  [TS_NODE]: ts.Node;
  name: string;
  parameters: ParameterMeta[];
  signature: {
    [TS_NODE]?: ts.Signature;
    type: string;
  };
  return: {
    [TS_NODE]?: ts.Type;
    type: string;
  };
  docs?: string;
  doctags?: DocTagMeta[];
  internal?: boolean;
  deprecated?: boolean;
}

export interface EventMeta {
  [TS_NODE]: ts.Node;
  name: string;
  type: TypeMeta;
  detail: string;
  docs?: string;
  doctags?: DocTagMeta[];
  bubbles?: boolean;
  composed?: boolean;
  cancellable?: boolean;
  internal?: boolean;
  deprecated?: boolean;
}

export interface CSSVarMeta {
  [TS_NODE]: ts.Node;
  name: string;
  default?: string;
  docs?: string;
  type?: TypeMeta;
  doctags?: DocTagMeta[];
  required?: boolean;
  readonly?: boolean;
  optional?: boolean;
  internal?: boolean;
  deprecated?: boolean;
}

export interface PartMeta {
  [TS_NODE]: ts.Node;
  name: string;
  docs?: string;
}

export interface StateMeta {
  [TS_NODE]: ts.Node;
  name: string;
  type: TypeMeta;
  default?: string;
  docs?: string;
  doctags?: DocTagMeta[];
  readonly?: boolean;
  deprecated?: boolean;
}

export interface DocTagMeta {
  [TS_NODE]: ts.Node;
  name: string;
  text?: string;
}

export interface FileMeta {
  [TS_NODE]: ts.SourceFile;
  path: string;
}

export interface MembersMeta {
  props?: PropMeta[];
  methods?: MethodMeta[];
  length: number;
}

export interface ComponentMeta extends Record<string, unknown> {
  [TS_NODE]: ts.ClassDeclaration;
  file: FileMeta;
  name: string;
  docs?: string;
  doctags?: DocTagMeta[];
  props?: PropMeta[];
  state?: StateMeta[];
  events?: EventMeta[];
  parts?: PartMeta[];
  cssvars?: CSSVarMeta[];
  members?: MembersMeta;
}
