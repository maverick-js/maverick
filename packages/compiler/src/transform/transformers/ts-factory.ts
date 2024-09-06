import { isArray, isString } from '@maverick-js/std';
import ts from 'typescript';

import {
  type AstNode,
  type AttributeNode,
  type ComponentNode,
  type ElementNode,
  type EventNode,
  type InferTsNode,
  isExpressionNode,
  type RefNode,
} from '../../parse/ast';
import {
  getAttributeNodeFullName,
  getEventNodeFullName,
  getNamedImportBindings,
} from '../../parse/utils';
import type { NextState } from '../../parse/walk';
import type { Transform } from './transformer';

export const $ = ts.factory as typeof ts.factory & {
  emptyString: () => ts.StringLiteral;
  emptyObject: () => ts.ObjectLiteralExpression;
  id: typeof ts.factory.createIdentifier;
  string: typeof ts.factory.createStringLiteral;
  number: typeof ts.factory.createNumericLiteral;
  undefined: ts.Identifier;
  var: typeof createVariableDeclaration;
  arrowFn: typeof createArrowFunction;
  call: typeof createCallExpression;
  selfInvoke: typeof createSelfInvokedCallExpression;
  selfInvokedFn: typeof createSelfInvokedFunction;
  prop: typeof createPropertyGetExpression;
  setProp: typeof createPropertySetExpression;
};

$.arrowFn = createArrowFunction;
$.emptyString = () => $.string('');
$.emptyObject = () => $.createObjectLiteralExpression();
$.id = $.createIdentifier;
$.call = createCallExpression;
$.selfInvoke = createSelfInvokedCallExpression;
$.selfInvokedFn = createSelfInvokedFunction;
$.prop = createPropertyGetExpression;
$.setProp = createPropertySetExpression;
$.string = $.createStringLiteral;
$.number = $.createNumericLiteral;
$.undefined = $.id('undefined');
$.var = createVariableDeclaration;

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

export function createComponentProps(node: ComponentNode) {
  if (!node.props?.length) return;
  return $.createObjectLiteralExpression(createAttributePropertyAssignmentList(node.props), true);
}

export function createComponentHostProps(node: ComponentNode, { ssr = false } = {}) {
  const props: ts.PropertyAssignment[] = [];

  if (node.class) {
    props.push($.createPropertyAssignment('class', node.class.initializer));
  }

  props.push(
    ...createAttributePropertyAssignmentList(node.classes),
    ...createAttributePropertyAssignmentList(node.vars),
  );

  if (!ssr) {
    props.push(...createEventPropertyAssignmentList(node.events));
  }

  if (!props.length) return;

  return $.createObjectLiteralExpression(props, true);
}

export function createComponentSlotsObject<State>(
  component: ComponentNode,
  transform: Transform<State>,
  nextState: NextState<State>,
) {
  if (!component.slots) return;

  const { slots } = component;

  return $.createObjectLiteralExpression(
    Object.keys(slots).map((slotName) => {
      const slot = slots[slotName],
        name = $.string(slotName);

      // Render function.
      if (isExpressionNode(slot) && isArrowFunctionWithParams(slot.expression)) {
        return $.createPropertyAssignment(name, transform(slot, nextState(slot))!);
      }

      const result = transform(slot, nextState(slot)) ?? $.createNull();
      return $.createPropertyAssignment(
        name,
        $.arrowFn([], getArrowFunctionBody(result) ?? result),
      );
    }),
    true,
  );
}

export function createElementProps(node: ElementNode, { ssr = false } = {}) {
  const props: ts.PropertyAssignment[] = [];

  props.push(
    ...createAttributePropertyAssignmentList(node.attrs),
    ...createAttributePropertyAssignmentList(node.classes),
    ...createAttributePropertyAssignmentList(node.styles),
    ...createAttributePropertyAssignmentList(node.vars),
  );

  if (!ssr) {
    props.push(...createAttributePropertyAssignmentList(node.props));
    props.push(...createEventPropertyAssignmentList(node.events));
    if (node.ref) {
      props.push(createRefPropertyAssignment(node.ref));
    }
  }

  return props.length > 0 ? $.createObjectLiteralExpression(props, true) : undefined;
}

export function createAttributePropertyAssignmentList(attrs?: AttributeNode[]) {
  return (attrs ?? []).map((attr) => createAttributePropertyAssignment(attr));
}

export function createAttributePropertyAssignment(attr: AttributeNode) {
  const name = getAttributeNodeFullName(attr);
  return $.createPropertyAssignment($.string(name), attr.initializer);
}

export function createEventPropertyAssignmentList(events?: EventNode[]) {
  return (events ?? []).map(createEventPropertyAssignment);
}
export function createEventPropertyAssignment(event: EventNode) {
  return $.createPropertyAssignment($.string(getEventNodeFullName(event)), event.initializer);
}

export function createRefPropertyAssignment(node: RefNode) {
  return $.createPropertyAssignment($.id('ref'), node.initializer);
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

export function removeImports(root: ts.SourceFile, imports: ts.ImportSpecifier[]) {
  return ts.transform(root, [
    (context) => () => {
      function visitNamedImports(node: ts.Node) {
        if (ts.isImportSpecifier(node) && imports.includes(node)) {
          return undefined;
        }

        return ts.visitEachChild(node, visitNamedImports, context);
      }

      function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
          const bindings = getNamedImportBindings(node, 'maverick.js');

          // If there are no imports then we remove the declaration completely.
          if (bindings && !bindings.some((specifier) => !imports.includes(specifier))) {
            return undefined;
          }

          visitNamedImports(node);

          return node;
        }
      }

      return ts.visitEachChild(root, visit, context);
    },
  ]).transformed[0];
}

export interface TsNodeMap extends WeakMap<ts.Node, ts.Node | undefined> {}

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

export function transformAstNodeChildren<Node extends AstNode, State>(
  node: Node,
  transform: Transform<State>,
  nextState: NextState<State>,
): InferTsNode<Node> {
  const map: TsNodeMap = new WeakMap();

  if ('children' in node && node.children) {
    for (const child of node.children) {
      map.set(child.node, transform(child, nextState(child)));
    }
  }

  return replaceTsNodes(
    isExpressionNode(node) ? node.expression : node.node,
    map,
  ) as InferTsNode<Node>;
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

export function createFunction(
  id: ts.Identifier,
  params: ts.BindingName[],
  body: (ts.Expression | ts.Statement)[] | ts.Block,
) {
  return $.createFunctionDeclaration(
    undefined,
    undefined,
    id,
    undefined,
    params.map((param) =>
      $.createParameterDeclaration(undefined, undefined, param, undefined, undefined, undefined),
    ),
    undefined,
    isArray(body)
      ? $.createBlock(
          body.map((node) => (ts.isStatement(node) ? node : $.createExpressionStatement(node))),
          true,
        )
      : body,
  );
}

export function createArrowFunction(
  params: ts.Identifier[],
  body: ts.Expression | ts.Block | (ts.Expression | ts.Statement)[],
) {
  return $.createArrowFunction(
    undefined,
    undefined,
    params.map((p) =>
      $.createParameterDeclaration(undefined, undefined, p, undefined, undefined, undefined),
    ),
    undefined,
    $.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    isArray(body)
      ? $.createBlock(
          body.map((node) => (ts.isStatement(node) ? node : $.createExpressionStatement(node))),
          true,
        )
      : body,
  );
}

export function createJsxFragment(children: ts.NodeArray<ts.JsxChild>) {
  return $.createJsxFragment(
    $.createJsxOpeningFragment(),
    children,
    $.createJsxJsxClosingFragment(),
  );
}

export function createNullFilledArgs(args: (ts.Expression | undefined | null)[]) {
  let pointer = 0,
    newArgs: ts.Expression[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg) {
      for (let j = pointer; j < i; j++) {
        if (!args[j]) newArgs.push($.createNull());
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
    imports: importsEnd >= 0 ? statements.slice(0, importsEnd + 1) : [],
    body: statements.slice(importsEnd >= 0 ? importsEnd + 1 : 0),
  };
}

let nameCount = 0,
  names = new WeakMap<ts.Node, ts.Identifier>();

export function getUniqueNameForNode(node: ts.Node) {
  let name = names.get(node);
  if (!name) names.set(node, (name = $.id(`$${++nameCount}`)));
  return name;
}

export function resetNameCount() {
  nameCount = 0;
}
