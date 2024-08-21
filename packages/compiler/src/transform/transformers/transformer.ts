import type MagicString from 'magic-string';
import type ts from 'typescript';

import type { AST } from '../../parse/ast';
import type { TransformContext } from '../transform';
import { DOMTransformer } from './dom';
import { ElementTransformer } from './element';
import { JSONTransformer } from './json';
import { ReactTransformer } from './react';
import { SSRTransformer } from './ssr';

export type TransformTarget = 'dom' | 'ssr' | 'element' | 'react' | 'json';

export interface Transformer {
  name: string;
  transform(data: TransformData): void;
}

export interface TransformData {
  code: MagicString;
  sourceFile: ts.SourceFile;
  jsx: AST[];
  ctx: TransformContext;
}

export function getTransformer(target: TransformTarget) {
  switch (target) {
    case 'dom':
      return DOMTransformer;
    case 'element':
      return ElementTransformer;
    case 'json':
      return JSONTransformer;
    case 'react':
      return ReactTransformer;
    case 'ssr':
      return SSRTransformer;
  }
}
