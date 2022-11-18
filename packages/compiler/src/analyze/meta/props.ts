import ts from 'typescript';

import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { escapeQuotes } from '../../utils/print';
import { camelToKebabCase } from '../../utils/str';
import { getDocs } from '../utils/docs';
import { buildTypeMeta } from '../utils/types';
import {
  getPropertyAssignmentValue,
  getReturnStatement,
  getValueNode,
  isCallExpression,
  walkProperties,
} from '../utils/walk';
import { type PropMeta, TS_NODE } from './component';
import { findDocTag, getDocTags, hasDocTag } from './doctags';

export interface PropMetaInfo {
  attribute?: string;
  reflect?: boolean;
  value?: ts.Node | false;
  generic?: ts.TypeNode;
}

export function buildPropsMeta(
  checker: ts.TypeChecker,
  root: ts.ObjectLiteralExpression,
): PropMeta[] | undefined {
  const meta: PropMeta[] = [],
    defs = getPropertyAssignmentValue(checker, root, 'props');

  if (defs) {
    const members = walkProperties(checker, defs);

    for (const [name, node] of members.props) {
      const value = getValueNode(checker, node.value) ?? node.value,
        isDefineProp = isCallExpression(value, 'defineProp'),
        initial = ts.isObjectLiteralExpression(value)
          ? getPropertyAssignmentValue(checker, value, 'initial')
          : isDefineProp
          ? getValueNode(checker, value.arguments[0])
          : false,
        definition = ts.isObjectLiteralExpression(value)
          ? value
          : isDefineProp && getValueNode(checker, value.arguments[1]);

      let info: PropMetaInfo = {
        value: initial,
      };

      if (isDefineProp && value.typeArguments?.[0]) {
        info.generic = value.typeArguments[0]!;
      }

      if (definition && ts.isObjectLiteralExpression(definition)) {
        const attr = getValueNode(
            checker,
            getPropertyAssignmentValue(checker, definition, 'attribute'),
          ),
          reflect = getValueNode(
            checker,
            getPropertyAssignmentValue(checker, definition, 'reflect'),
          );

        if (!attr || attr.kind !== ts.SyntaxKind.FalseKeyword) {
          info.attribute =
            attr?.kind === ts.SyntaxKind.StringLiteral
              ? escapeQuotes(attr.getText())
              : camelToKebabCase(name);
        }

        if (reflect && reflect.kind !== ts.SyntaxKind.FalseKeyword) {
          info.reflect = true;
        }
      } else {
        info.attribute = camelToKebabCase(name);
      }

      const prop = buildPropMeta(checker, name, node.assignment, info);
      if (prop) meta.push(prop);
    }
  }

  return meta.length > 0 ? meta : undefined;
}

export function buildPropMeta(
  checker: ts.TypeChecker,
  name: string,
  node:
    | ts.VariableDeclaration
    | ts.PropertyAssignment
    | ts.GetAccessorDeclaration
    | ts.PropertySignature
    | ts.ShorthandPropertyAssignment,
  info?: PropMetaInfo,
): PropMeta | undefined {
  const identifier = node.name as ts.Identifier,
    symbol = checker.getSymbolAtLocation(identifier)!,
    isGetAccessor = ts.isGetAccessor(node),
    hasSetAccessor = ts.isGetAccessor(node)
      ? symbol.declarations!.some(ts.isSetAccessorDeclaration)
      : undefined,
    docs = getDocs(checker, identifier),
    doctags = getDocTags(node),
    readonly =
      (isGetAccessor && !hasSetAccessor) ||
      (!hasSetAccessor && doctags && hasDocTag(doctags, 'readonly'));

  let internal!: PropMeta['internal'],
    deprecated!: PropMeta['deprecated'],
    required!: PropMeta['required'],
    $default!: PropMeta['default'],
    attribute!: PropMeta['attribute'],
    reflect!: PropMeta['reflect'],
    accessor!: PropMeta['accessor'];

  if (doctags) {
    if (hasDocTag(doctags, 'internal')) internal = true;
    if (hasDocTag(doctags, 'deprecated')) deprecated = true;
    if (hasDocTag(doctags, 'required')) required = true;
    $default =
      findDocTag(doctags, 'default')?.text ?? findDocTag(doctags, 'defaultValue')?.text ?? '';
  }

  if (isGetAccessor || hasSetAccessor) {
    accessor = {
      get: isGetAccessor ? true : undefined,
      set: hasSetAccessor ? true : undefined,
    };
  }

  if (info) {
    if (!readonly) {
      attribute = info.attribute;
      reflect = info.reflect;
    }
  }

  let value: ts.Node | undefined;

  if (info?.value !== false) {
    if (info?.value) {
      value = info.value;
    } else {
      value = getValueNode(checker, node);
    }
  }

  if (!value) {
    reportDiagnosticByNode('could not resolve value node', node, LogLevel.Warn);
    return undefined;
  }

  const type = buildTypeMeta(checker, value, info?.generic);

  if (!$default) {
    if (ts.isGetAccessor(node)) {
      const returnExpression = getReturnStatement(node)?.expression;
      if (returnExpression) {
        if (
          ts.isCallExpression(returnExpression) &&
          ts.isIdentifier(returnExpression.expression) &&
          returnExpression.arguments.length === 0
        ) {
          const value = getValueNode(checker, returnExpression.expression);
          if (
            value &&
            (isCallExpression(value, 'observable') || isCallExpression(value, 'computed')) &&
            value.arguments[0]
          ) {
            $default = value.arguments[0].getText();
          } else {
            $default = returnExpression.getText();
          }
        } else {
          $default = returnExpression.getText();
        }
      } else {
        $default = 'unknown';
      }
    } else {
      $default = value.getText();
    }
  }

  return {
    [TS_NODE]: node,
    name,
    default: $default,
    type,
    docs,
    doctags,
    required,
    readonly: readonly ? true : undefined,
    attribute,
    reflect,
    internal,
    deprecated,
    accessor,
  };
}
