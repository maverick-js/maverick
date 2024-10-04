import { $, isTrueKeyword } from '@maverick-js/ts';
import type ts from 'typescript';

import type { ElementNode } from '../../../parse/ast';
import { getReactPropName } from './attr-map';

const REACT_NODE_SYMBOL = Symbol.for('react.node');

export interface ReactNode {
  [REACT_NODE_SYMBOL]: true;
  name: string | ts.Identifier;
  props?: ReactNodeProps;
  children: ReactNodeChild[];
}

export type ReactNodeName = string | ts.Identifier;

export type ReactNodeProps = ts.Identifier | ts.ObjectLiteralElementLike[];

export type ReactNodeChild = ts.Expression | ReactNode;

export function createReactNode(
  name: ReactNodeName,
  props?: ReactNodeProps,
  ...children: ReactNodeChild[]
): ReactNode {
  return {
    [REACT_NODE_SYMBOL]: true,
    name,
    props,
    children,
  };
}

export function isReactNode(node: object): node is ReactNode {
  return REACT_NODE_SYMBOL in node;
}

export function createDangerouslySetInnerHTMLProp(init: ts.Expression) {
  return $.createPropertyAssignment(
    'dangerouslySetInnerHTML',
    $.object([$.createPropertyAssignment('__html', init)]),
  );
}

export function createStaticReactNodeProps(node: ElementNode) {
  const props: ts.PropertyAssignment[] = [];

  if (node.attrs) {
    for (const attr of node.attrs) {
      const name = getReactPropName(attr.name);
      props.push($.createPropertyAssignment(name, attr.initializer));
    }
  }

  if (node.classes) {
    const classList: string[] = [];

    for (const c of node.classes) {
      if (!isTrueKeyword(c.initializer)) continue;
      classList.push(c.name);
    }

    if (classList.length > 0) {
      props.push($.createPropertyAssignment('className', $.string(classList.join(' '))));
    }
  }

  if (node.styles || node.vars) {
    const styles: ts.PropertyAssignment[] = [];

    if (node.styles) {
      for (const style of node.styles) {
        styles.push($.createPropertyAssignment(style.name, style.initializer));
      }
    }

    if (node.vars) {
      for (const v of node.vars) {
        styles.push($.createPropertyAssignment($.string(`--${v.name}`), v.initializer));
      }
    }

    if (styles.length > 0) {
      props.push($.createPropertyAssignment('style', $.object(styles, true)));
    }
  }

  if (node.content) {
    props.push(createDangerouslySetInnerHTMLProp(node.content.initializer));
  }

  return props.length > 0 ? props : undefined;
}
