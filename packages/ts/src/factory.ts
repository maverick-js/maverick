import { isArray, isString, isUndefined } from '@maverick-js/std';
import ts, { type NodeArray } from 'typescript';

import { isTrueKeyword, isValueImportDeclarationFrom } from './is';
import { getNamedImportBindings } from './module';

export const $ = ts.factory as typeof ts.factory & {
  emptyString: ts.StringLiteral;
  emptyObject: ts.ObjectLiteralExpression;
  id: typeof ts.factory.createIdentifier;
  string: typeof ts.factory.createStringLiteral;
  number: typeof ts.factory.createNumericLiteral;
  bool: typeof createBool;
  array: typeof ts.factory.createArrayLiteralExpression;
  object: typeof ts.factory.createObjectLiteralExpression;
  undefined: ts.Identifier;
  null: ts.NullLiteral;
  var: typeof createVariableDeclaration;
  fn: typeof createFunction;
  bind: typeof bind;
  arrowFn: typeof createArrowFunction;
  call: typeof createCallExpression;
  selfInvoke: typeof createSelfInvokedCallExpression;
  selfInvokedFn: typeof createSelfInvokedFunction;
  prop: typeof createPropertyGetExpression;
  setProp: typeof createPropertySetExpression;
  jsxElement: typeof createJsxElement;
  jsxVoidElement: typeof createJsxSelfClosingElement;
  jsxAttrs: typeof createJsxAttributes;
  jsxAttr: typeof createJsxAttribute;
  jsxExpression: typeof createJsxExpression;
  jsxFragment: typeof createJsxFragment;
  pure: typeof pure;
  block: typeof createBlock;
  ternary: typeof createTernaryExpression;
  if: typeof createIfStatement;
  not: typeof createNotExpression;
};

$.id = $.createIdentifier;
$.var = createVariableDeclaration;

$.string = $.createStringLiteral;
$.bool = createBool;
$.emptyString = $.string('');
$.emptyObject = $.createObjectLiteralExpression();
$.array = $.createArrayLiteralExpression;
$.object = $.createObjectLiteralExpression;
$.number = $.createNumericLiteral;
$.undefined = $.id('undefined');
$.null = $.createNull();
$.prop = createPropertyGetExpression;
$.setProp = createPropertySetExpression;

$.bind = bind;
$.fn = createFunction;
$.arrowFn = createArrowFunction;
$.call = createCallExpression;
$.selfInvoke = createSelfInvokedCallExpression;
$.selfInvokedFn = createSelfInvokedFunction;

$.jsxElement = createJsxElement;
$.jsxVoidElement = createJsxSelfClosingElement;
$.jsxFragment = createJsxFragment;
$.jsxExpression = createJsxExpression;
$.jsxAttrs = createJsxAttributes;
$.jsxAttr = createJsxAttribute;

$.pure = pure;
$.block = createBlock;
$.ternary = createTernaryExpression;
$.if = createIfStatement;
$.not = createNotExpression;

export function createBlock(statements: Array<ts.Expression | ts.Statement>, multiLine = true) {
  return $.createBlock(createStatements(statements), multiLine);
}

export function createImports(specifiers: ts.Identifier[], module: string, isTypeOnly = false) {
  return $.createImportDeclaration(
    undefined,
    $.createImportClause(
      isTypeOnly,
      undefined,
      $.createNamedImports(
        specifiers.map((name) => $.createImportSpecifier(false, undefined, name)),
      ),
    ),
    $.string(module),
  );
}

export function createVariableStatement(variables: ts.VariableDeclaration[]) {
  return $.createVariableStatement(
    undefined,
    $.createVariableDeclarationList(variables, ts.NodeFlags.Let),
  );
}

export function createVariableDeclaration<T extends string | ts.BindingName>(
  name: T,
  init?: ts.Expression,
) {
  return $.createVariableDeclaration(
    isString(name) ? $.createUniqueName(name) : name,
    undefined,
    undefined,
    init,
  ) as ts.VariableDeclaration & {
    readonly name: T extends string ? ts.Identifier : ts.BindingName;
  };
}

export function getFirstVariableDeclarationName(
  node: ts.VariableStatement | ts.VariableDeclarationList,
) {
  const list = ts.isVariableStatement(node) ? node.declarationList : node;
  return list.declarations[0]?.name as ts.Identifier | undefined;
}

export function createDomElementAccessExpression(parent: ts.Identifier, childIndex: number) {
  let expr = $.prop(parent, $.id('firstChild'));

  for (let i = 1; i <= childIndex; i++) {
    expr = $.prop(expr, $.id('nextSibling'));
  }

  return expr;
}

export function createSiblingElementAccessExpression(siblingId: ts.Identifier, distance: number) {
  let expr = $.prop(siblingId, $.id('nextSibling'));

  for (let i = 1; i < distance; i++) {
    expr = $.prop(expr, $.id('nextSibling'));
  }

  return expr;
}

export function createArrayBindingPattern(...names: ts.Identifier[]) {
  return $.createArrayBindingPattern(
    names.map((name) => $.createBindingElement(undefined, undefined, name, undefined)),
  );
}

export function createObjectBindingPattern(...names: ts.Identifier[]) {
  return $.createObjectBindingPattern(
    names.map((name) => $.createBindingElement(undefined, undefined, name, undefined)),
  );
}

export function createCallExpression(expression: ts.Expression, args?: ts.Expression[]) {
  return $.createCallExpression(expression, undefined, args ?? []);
}

export function createSelfInvokedCallExpression(node: ts.Expression) {
  return $.createCallExpression($.createParenthesizedExpression(node), undefined, []);
}

export function getArrowFunctionBody(node: ts.Expression) {
  if (ts.isCallExpression(node) && ts.isParenthesizedExpression(node.expression)) {
    const returned = node.expression.expression;
    return ts.isArrowFunction(returned) ? returned.body : returned;
  } else if (ts.isArrowFunction(node)) {
    return node.body;
  }
}

export function createSelfInvokedFunction(block: ts.Block) {
  return $.createCallExpression(
    $.createParenthesizedExpression(createArrowFunction([], block)),
    undefined,
    [],
  );
}

export function removeImports(
  root: ts.SourceFile,
  moduleSpecifier: string,
  imports: ts.ImportSpecifier[],
) {
  return ts.transform(root, [
    (context) => () => {
      function visitNamedImports(node: ts.Node) {
        if (ts.isImportSpecifier(node) && imports.includes(node)) {
          return;
        }

        return ts.visitEachChild(node, visitNamedImports, context);
      }

      function visit(node: ts.Node) {
        if (isValueImportDeclarationFrom(node, moduleSpecifier)) {
          const bindings = getNamedImportBindings(node);

          // If there are no imports then we remove the declaration completely.
          if (bindings && !bindings.some((specifier) => !imports.includes(specifier))) {
            return;
          }

          return visitNamedImports(node);
        }

        return node;
      }

      return ts.visitEachChild(root, visit, context);
    },
  ]).transformed[0];
}

export interface TsNodeMap extends WeakMap<ts.Node, ts.Node | ts.Node[] | undefined> {}

export function replaceTsNodes<T extends ts.Node>(root: T, replace: TsNodeMap) {
  return ts.transform(root, [
    (context) => () => {
      function visit(node: ts.Node) {
        if (replace.has(node)) return replace.get(node);
        return ts.visitEachChild(node, visit, context);
      }

      return ts.visitEachChild(root, visit, context);
    },
  ]).transformed[0];
}

export function createPropertyGetExpression(obj: ts.Expression, prop: string | ts.Identifier) {
  return $.createPropertyAccessExpression(obj, isString(prop) ? $.id(prop) : prop);
}

export function createPropertySetExpression(
  obj: ts.Expression,
  prop: string | ts.Identifier,
  value: ts.Expression,
) {
  return $.createBinaryExpression(
    $.createPropertyAccessExpression(obj, isString(prop) ? $.id(prop) : prop),
    $.createToken(ts.SyntaxKind.EqualsToken),
    value,
  );
}

export function createBool<T extends boolean>(
  isTrue: T,
): T extends true ? ts.TrueLiteral : ts.FalseLiteral {
  return (isTrue ? $.createTrue() : $.createFalse()) as any;
}

export function createFunction(
  id: ts.Identifier,
  params:
    | Array<ts.BindingName | ts.ParameterDeclaration>
    | NodeArray<ts.BindingName | ts.ParameterDeclaration>
    | undefined,
  body: (ts.Expression | ts.Statement)[] | ts.Block,
) {
  return $.createFunctionDeclaration(
    undefined,
    undefined,
    id,
    undefined,
    params?.map(mapBindingNameToParam) ?? [],
    undefined,
    isArray(body) ? $.block(body) : body,
  );
}

function mapBindingNameToParam(p: ts.BindingName | ts.ParameterDeclaration) {
  return ts.isBindingName(p) ? $.createParameterDeclaration(undefined, undefined, p) : p;
}

export function createStatements(nodes: Array<ts.Expression | ts.Statement>) {
  return nodes.map((node) =>
    ts.isStatement(node) ? node : ts.isExpression(node) ? $.createExpressionStatement(node) : node,
  );
}

export function createArrowFunction(
  params:
    | Array<ts.BindingName | ts.ParameterDeclaration>
    | NodeArray<ts.BindingName | ts.ParameterDeclaration>
    | undefined,
  body: ts.Expression | ts.Block | Array<ts.Expression | ts.Statement>,
) {
  // Avoid creating arrow function wrappers around a single function call
  // () => a() is simplified to a
  if (
    !isArray(body) &&
    ts.isCallExpression(body) &&
    body.arguments.length === 0 &&
    ts.isIdentifier(body.expression)
  ) {
    return body.expression;
  }

  if (isArray(body) && body[0] && ts.isReturnStatement(body[0])) {
    body = body[0].expression!;
  }

  return $.createArrowFunction(
    undefined,
    undefined,
    params?.map(mapBindingNameToParam) ?? [],
    undefined,
    $.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    isArray(body) ? $.block(body) : body,
  );
}

export function createNullFilledArgs(args: (ts.Expression | undefined | null)[]) {
  let pointer = 0,
    newArgs: ts.Expression[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg) {
      for (let j = pointer; j < i; j++) {
        if (!args[j]) newArgs.push($.null);
        pointer = j + 1;
      }

      newArgs.push(arg);
    }
  }

  return newArgs;
}

export function isArrowFunctionWithParams(node: ts.Node): node is ts.ArrowFunction {
  return ts.isArrowFunction(node) && node.parameters.length > 0;
}

export function splitImportsAndBody({ statements }: ts.SourceFile) {
  let importsEnd = -1,
    statement = statements[importsEnd + 1];

  while (statement && ts.isImportDeclaration(statement)) {
    importsEnd += 1;
    statement = statements[importsEnd + 1];
  }

  return {
    imports: (importsEnd >= 0 ? statements.slice(0, importsEnd + 1) : []) as ts.ImportDeclaration[],
    body: statements.slice(importsEnd >= 0 ? importsEnd + 1 : 0),
  };
}

let idCount = 0,
  identifiers = new WeakMap<ts.Node, ts.Identifier>();

export function getUniqueId(node: ts.Node) {
  let name = identifiers.get(node);
  if (!name) identifiers.set(node, (name = $.id(`$${++idCount}`)));
  return name;
}

export function hasUniqueId(node: ts.Node) {
  return !isUndefined(identifiers.get(node));
}

export function resetUniqueIdCount() {
  idCount = 0;
}

export function createSymbolFor(key: string) {
  return $.createCallExpression(
    $.createPropertyAccessExpression($.createIdentifier('Symbol'), $.createIdentifier('for')),
    undefined,
    [$.createStringLiteral(key)],
  );
}

export function createStaticComputedProperty(name: ts.Expression, init: ts.Expression) {
  return $.createPropertyDeclaration(
    [$.createToken(ts.SyntaxKind.StaticKeyword)],
    $.createComputedPropertyName(name),
    undefined,
    undefined,
    init,
  );
}

export function createStaticComputedMethod(
  name: ts.Expression,
  params:
    | Array<ts.BindingName | ts.ParameterDeclaration>
    | NodeArray<ts.BindingName | ts.ParameterDeclaration>,
  block: Array<ts.Expression | ts.Statement>,
) {
  return $.createMethodDeclaration(
    [$.createToken(ts.SyntaxKind.StaticKeyword)],
    undefined,
    $.createComputedPropertyName(name),
    undefined,
    undefined,
    params.map(mapBindingNameToParam),
    undefined,
    $.block(block),
  );
}

export function addClassMembers(node: ts.ClassDeclaration, newMembers: ts.ClassElement[]) {
  return $.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    [...newMembers, ...node.members],
  );
}

export function createJsxElement(
  tagName: string,
  attrs: ts.JsxAttribute[] = [],
  children: ts.JsxChild[] | ts.NodeArray<ts.JsxChild> = [],
) {
  return $.createJsxElement(
    $.createJsxOpeningElement($.createIdentifier(tagName), undefined, createJsxAttributes(attrs)),
    children,
    $.createJsxClosingElement($.createIdentifier('div')),
  );
}

export function createJsxSelfClosingElement(tagName: string, attrs: ts.JsxAttribute[]) {
  return $.createJsxSelfClosingElement(
    $.createIdentifier(tagName),
    undefined,
    createJsxAttributes(attrs),
  );
}

export function createJsxAttributes(attrs: ts.JsxAttribute[] = []) {
  return $.createJsxAttributes(
    Object.keys(attrs).map((name) => createJsxAttribute(name, attrs[name])),
  );
}

export function createJsxAttribute(name: string, init?: ts.JsxAttributeValue) {
  return $.createJsxAttribute(
    $.createIdentifier(name),
    init && !isTrueKeyword(init) ? $.createJsxExpression(undefined, init) : undefined,
  );
}

export function createJsxFragment(children: ts.JsxChild[] | ts.NodeArray<ts.JsxChild> = []) {
  return $.createJsxFragment(
    $.createJsxOpeningFragment(),
    children,
    $.createJsxJsxClosingFragment(),
  );
}

export function createJsxExpression(
  expression: ts.Expression | undefined,
  dotDotDotToken?: ts.DotDotDotToken,
) {
  return $.createJsxExpression(dotDotDotToken, expression);
}

/** Binding arguments to a function. */
export function bind(fnId: ts.Identifier, thisArg: ts.Expression, args: ts.Expression[]) {
  return $.call($.prop(fnId, 'bind'), [thisArg, ...args]);
}

/** Mark a node as pure so bundlers can safely remove the code if it's not used. */
export function pure<T extends ts.Node>(node: T): T {
  return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, ' @__PURE__ ');
}

export function createNullishCoalescingAssignment(left: ts.Expression, right: ts.Expression) {
  return $.createBinaryExpression(
    left,
    $.createToken(ts.SyntaxKind.QuestionQuestionEqualsToken),
    right,
  );
}

export function createTernaryExpression(
  condition: ts.Expression,
  truthy: ts.Expression,
  falsy: ts.Expression,
) {
  return $.createConditionalExpression(
    condition,
    $.createToken(ts.SyntaxKind.QuestionToken),
    truthy,
    $.createToken(ts.SyntaxKind.ColonToken),
    falsy,
  );
}

export function createIfStatement(
  condition: ts.Expression,
  block: Array<ts.Expression | ts.Statement>,
  elseBlock?: ts.Statement | Array<ts.Expression | ts.Statement>,
) {
  $.createIfStatement(
    condition,
    $.block(block),
    !isArray(elseBlock) ? elseBlock : $.block(elseBlock),
  );
}

export function createNotExpression(operand: ts.Expression) {
  return $.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, operand);
}
