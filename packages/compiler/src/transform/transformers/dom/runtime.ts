import ts from 'typescript';

import { RuntimeId, type RuntimeVars } from './constants';

export function createRuntimeVariable(id: RuntimeVars, expression?: ts.Expression) {
  return ts.factory.createVariableDeclaration(id, undefined, undefined, expression);
}

export function createTemplate(html: string) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.createTemplate),
    undefined,
    [ts.factory.createStringLiteral(html)],
  );
}

export function createFragment() {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.createFragment),
    undefined,
    [],
  );
}

export function createComponent(id: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.createComponent),
    undefined,
    [id],
  );
}

export function createWalker(fragment: ts.Identifier, walker: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.createWalker),
    undefined,
    [fragment, walker],
  );
}

export function nextTemplate(fragment: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.nextTemplate),
    undefined,
    [fragment],
  );
}

export function nextElement(walker: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.nextElement),
    undefined,
    [walker],
  );
}

export function createElement(tagName: string) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.createElement),
    undefined,
    [ts.factory.createStringLiteral(tagName)],
  );
}

export function setupCustomElement(
  host: ts.Identifier,
  props: ts.Identifier | ts.ObjectLiteralExpression,
) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.setupCustomElement),
    undefined,
    [host, props],
  );
}

export function children(id: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.children),
    undefined,
    [id],
  );
}

export function insert(parent: ts.Identifier, value: ts.Identifier, marker?: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.insert),
    undefined,
    marker ? [parent, value, marker] : [parent, value],
  );
}

export function insertAtMarker(marker: ts.Identifier, value: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.insertAtMarker),
    undefined,
    [marker, value],
  );
}

export function listen(
  target: ts.Identifier,
  type: string,
  handler: ts.Expression,
  capture: boolean,
) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.listen), undefined, [
    target,
    ts.factory.createStringLiteral(type),
    handler,
    capture ? ts.factory.createTrue() : ts.factory.createFalse(),
  ]);
}

export function delegateEvents(types: ts.ArrayLiteralExpression) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.delegateEvents),
    undefined,
    [types],
  );
}

export function clone(fragment: ts.Identifier) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.clone), undefined, [
    fragment,
  ]);
}

export function ref(element: ts.Identifier, ref: ts.Expression) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.ref), undefined, [
    element,
    ref,
  ]);
}

export function attr(el: ts.Identifier, name: string, value: ts.Expression) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.attr), undefined, [
    el,
    ts.factory.createStringLiteral(name),
    value,
  ]);
}

export function _class(el: ts.Identifier, name: string, value: ts.Expression) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.class), undefined, [
    el,
    ts.factory.createStringLiteral(name),
    value,
  ]);
}

export function style(el: ts.Identifier, prop: string, value: ts.Expression) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.style), undefined, [
    el,
    ts.factory.createStringLiteral(prop),
    value,
  ]);
}

export function spread(el: ts.Identifier, props: ts.Identifier | ts.ObjectLiteralExpression) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.spread), undefined, [
    el,
    props,
  ]);
}

export function mergeProps(sources: ts.Expression[]) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.mergeProps),
    undefined,
    sources,
  );
}

export function computed(compute: ts.Identifier) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(RuntimeId.computed),
    undefined,
    [compute],
  );
}

export function effect(compute: ts.Identifier) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.effect), undefined, [
    compute,
  ]);
}

export function peek(compute: ts.Identifier) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.peek), undefined, [
    compute,
  ]);
}

export function scoped(compute: ts.Identifier) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(RuntimeId.scoped), undefined, [
    compute,
  ]);
}
