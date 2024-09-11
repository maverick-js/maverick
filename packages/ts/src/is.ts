import { trimQuotes } from '@maverick-js/std';
import ts from 'typescript';

import type { JsxElementNode } from './types';

export function isComponentTagName(tagName: string) {
  return (
    !tagName.includes('-') &&
    ((tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
      tagName.includes('.') ||
      /[^a-zA-Z]/.test(tagName[0]))
  );
}

export function isTrueKeyword(node: ts.Node) {
  return node.kind === ts.SyntaxKind.TrueKeyword;
}

export function isFalseKeyword(node: ts.Node) {
  return node.kind === ts.SyntaxKind.FalseKeyword;
}

export function isBoolLiteral(node: ts.Node) {
  return isTrueKeyword(node) || isFalseKeyword(node);
}

export function isNullNode(node: ts.Node): node is ts.NullLiteral {
  return node.kind === ts.SyntaxKind.NullKeyword;
}

export function isUndefinedNode(node: ts.Node): node is ts.Identifier {
  return isIdentifierWithText(node, 'undefined');
}

export function isNullishNode(node: ts.Node) {
  return isNullNode(node) || isUndefinedNode(node);
}

export function isLogicalAndExpression(node: ts.Node): node is ts.BinaryExpression {
  return (
    ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
  );
}

export function isNullishCoalescing(node: ts.Node): node is ts.BinaryExpression {
  return (
    ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
  );
}

export function isLogicalOrExpression(node: ts.Node): node is ts.BinaryExpression {
  return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarToken;
}

export function isStringLiteral(node: ts.Node) {
  return ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node);
}

export function isStaticLiteralNode(node: ts.Node) {
  return (
    ts.isLiteralExpression(node) ||
    ts.isNumericLiteral(node) ||
    isStringLiteral(node) ||
    isBoolLiteral(node)
  );
}

export function isEmptyNode(node: ts.Node) {
  const text = trimQuotes(node.getText().trim());
  return text.length === 0 || text === '() => {}';
}

export function isEmptyExpressionNode(node: ts.Node) {
  return ts.isJsxExpression(node) && isEmptyNode(node);
}

export function isEmptyTextNode(node: ts.Node) {
  return ts.isJsxText(node) && (isEmptyNode(node) || /^[\r\n]\s*$/.test(node.getText()));
}

export function isJsxElementNode(node: ts.Node): node is JsxElementNode {
  return ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
}

export function isJsxRootNode(node: ts.Node) {
  return isJsxElementNode(node) || ts.isJsxFragment(node);
}

export function isValueImportDeclarationFrom(
  node: ts.Node,
  moduleSpecifier: string,
): node is ts.ImportDeclaration {
  return (
    ts.isImportDeclaration(node) &&
    !node.importClause?.isTypeOnly &&
    ts.isStringLiteral(node.moduleSpecifier) &&
    node.moduleSpecifier.text === moduleSpecifier
  );
}

export function isValueImportSpecifier(
  specifier: ts.ImportSpecifier | undefined,
): specifier is ts.ImportSpecifier {
  return !specifier?.isTypeOnly;
}

export function isTypeImportSpecifier(
  specifier: ts.ImportSpecifier | undefined,
): specifier is ts.ImportSpecifier {
  return !isValueImportSpecifier(specifier);
}

export function isIdentifierWithText(
  node: ts.Node | undefined,
  text: string,
): node is ts.Identifier {
  return !!node && ts.isIdentifier(node) && node.escapedText === text;
}

export function isStaticPropDeclaration(node: ts.Node): node is ts.PropertyDeclaration {
  return (
    ts.isPropertyDeclaration(node) &&
    !!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword)
  );
}
