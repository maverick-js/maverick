import type ts from 'typescript';

import type { DocTagMeta, FileMeta } from './component';
import type { TS_NODE_SYMBOL } from './symbols';

export interface TagMeta {
  [TS_NODE_SYMBOL]?: ts.PropertyDeclaration;
  name: string;
}

export interface AttrMeta {
  [TS_NODE_SYMBOL]?: ts.Node;
  attr: string | false;
}

export interface AttrsMeta {
  [propName: string]: AttrMeta;
}

export interface SlotMeta {
  [TS_NODE_SYMBOL]?: ts.Node;
  name?: string;
  docs?: string;
}

export interface CSSPartMeta {
  [TS_NODE_SYMBOL]?: ts.Node;
  name: string;
  docs?: string;
}

export interface CustomElementMeta {
  [TS_NODE_SYMBOL]?: ts.ClassDeclaration;
  type: 'element';
  name: string;
  file: FileMeta;
  tag: TagMeta;
  component?: {
    [TS_NODE_SYMBOL]?: ts.ClassDeclaration;
    name: string;
  };
  docs?: string;
  doctags?: DocTagMeta[];
  attrs?: AttrsMeta;
  slots?: SlotMeta[];
  cssparts?: CSSPartMeta[];
}
