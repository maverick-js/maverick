import type ts from 'typescript';

import type { DocTagMeta, FileMeta, TS_NODE } from './component';

export interface TagMeta {
  [TS_NODE]: ts.PropertyDeclaration;
  name: string;
}

export interface AttrMeta {
  [TS_NODE]: ts.Node;
  attr: string | false;
}

export interface AttrsMeta {
  [propName: string]: AttrMeta;
}

export interface SlotMeta {
  [TS_NODE]: ts.Node;
  name?: string;
  docs?: string;
}

export interface CSSPartMeta {
  [TS_NODE]: ts.Node;
  name: string;
  docs?: string;
}

export interface ElementMeta {
  [TS_NODE]: ts.ClassDeclaration;
  name: string;
  file: FileMeta;
  tag: TagMeta;
  component: {
    [TS_NODE]: ts.ClassDeclaration;
    name: string;
  };
  docs?: string;
  doctags?: DocTagMeta[];
  attrs?: AttrsMeta;
  slots?: SlotMeta[];
  cssparts?: CSSPartMeta[];
}
