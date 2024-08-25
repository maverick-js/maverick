import ts from 'typescript';

import { type ComponentNode, isElementNode, isExpressionNode } from '../../../../parse/ast';
import type { NextState } from '../../../../parse/walk';
import type { Transform } from '../../transformer';
import {
  $,
  createComponentAttrs,
  createComponentProps,
  getArrowFunctionBody,
  isArrowFunctionWithParams,
} from '../../ts-factory';
import type { DomTransformState, DomVisitorContext } from '../context';
import { insert } from '../position';
import { transform } from '../transform';

export function Component(node: ComponentNode, { state, walk }: DomVisitorContext) {
  let component = state.vars.block.component(
      node.name,
      !node.spreads ? createComponentProps(node) : undefined,
      createSlotsObjectLiteralExpression(node, transform, state.createChild),
      !node.spreads ? createAttachHostCallback(node, state) : undefined,
    ),
    rootElement = walk.path.find(isElementNode);

  if (rootElement) {
    insert(rootElement, component, node, state, walk);
  }

  if (node.spreads) {
    state.block.push(
      state.runtime.componentSpread(
        component,
        state.runtime.mergeProps(
          node.spreads
            ? [
                ...node.spreads.map((s) => s.initializer),
                createComponentProps(node),
                createComponentAttrs(node),
              ]
            : [createComponentProps(node), createComponentAttrs(node)],
        ),
      ),
    );
  } else {
    if (node.events) {
      for (const event of node.events) {
        if (event.forward) {
          state.block.push(state.runtime.forwardEvent(component, event.type, event.capture));
        } else {
          state.block.push(
            state.runtime.listen(component, event.type, event.initializer, event.capture),
          );
        }
      }
    }
  }
}

function createSlotsObjectLiteralExpression<State>(
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
  );
}

function createAttachHostCallback(node: ComponentNode, state: DomTransformState) {
  const host = $.id('host'),
    block: ts.Expression[] = [];

  if (node.class) {
    block.push(state.runtime.appendClass(host, node.class.initializer));
  }

  if (node.classes) {
    for (const c of node.classes) {
      block.push(state.runtime.class(host, c.name, c.initializer));
    }
  }

  if (node.vars) {
    for (const cssvar of node.vars) {
      block.push(state.runtime.style(host, `--${cssvar.name}`, cssvar.initializer));
    }
  }

  return block.length > 0 ? $.arrowFn([host], block) : undefined;
}
