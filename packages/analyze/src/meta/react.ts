import type ts from 'typescript';

import type { DocTagMeta, FileMeta, ParameterMeta, PropMeta, TypeMeta } from './component';
import type { TS_NODE } from './symbols';

export interface ReactRefMeta {
  type: TypeMeta;
}

export interface ReactPropMeta extends PropMeta {}

export interface ReactCallbackMeta {
  [TS_NODE]?: ts.Node;
  name: string;
  type: TypeMeta;
  docs?: string;
  doctags?: DocTagMeta[];
  parameters?: ParameterMeta[];
  internal?: boolean;
  deprecated?: boolean;
}

export interface ModuleExport {
  file: string;
  /** If this is undefined, everything is re-exported. */
  alias?: Record<string, string>;
}

export interface ReactComponentMeta extends Record<string, unknown> {
  [TS_NODE]?: ts.Node;
  type: 'react';
  file: FileMeta;
  namespace?: string;
  exports?: ModuleExport[];
  name: string;
  displayName?: string;
  docs?: string;
  doctags?: DocTagMeta[];
  attributes?: string;
  instance?: string;
  props?: ReactPropMeta[];
  propsType?: string;
  callbacks?: ReactCallbackMeta[];
  ref?: ReactRefMeta;
}
