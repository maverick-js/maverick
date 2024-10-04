import { isArray } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';
import ts from 'typescript';

import { type ComponentNode, isExpressionNode } from '../../../../parse/ast';
import { createAttachHostCallback } from '../../dom/nodes/component';
import {
  createComponentProps,
  createComponentSlotsObject,
  createEventPropertyAssignmentList,
} from '../../shared/factory';
import type { ReactTransformState, ReactVisitorContext } from '../state';
import { transform } from '../transform';
import { resolveExpressionChild } from './expression';

export function Component(node: ComponentNode, { state }: ReactVisitorContext) {
  const { runtime, domRuntime } = state,
    // Avoid creating a render function wrapper if not needed.
    scope = state.isExpressionChild ? 'render' : 'setup';

  const parent = state.node;
  state.node = null; // temp remove so slots create new roots.

  const $props = createComponentProps(node);

  const props = !node.spreads
      ? $props
      : domRuntime.mergeProps([...node.spreads.map((s) => s.initializer), $props]),
    listeners = !node.spreads
      ? createListenersCallback(node, state)
      : domRuntime.listenCallback(
          ...node.spreads.map((s) => s.initializer),
          node.events && node.spreads
            ? $.object(createEventPropertyAssignmentList(node.events), true)
            : undefined,
        ),
    slots = createComponentSlotsObject(
      node,
      transform,
      (node) => state.child(node),
      (slot, childState, result, resolve) => {
        if (isExpressionNode(slot) && ts.isArrowFunction(slot.expression)) {
          // Pass render function identifiers directly to slot.
          if (!isArray(result)) {
            return result;
          }
        }

        if (childState.isExpressionChild) {
          return resolve(resolveExpressionChild(result, state, childState));
        }

        return resolve(result);
      },
    ),
    onAttach = createAttachHostCallback(node, domRuntime);

  const component = runtime.component(node.name, props, listeners, slots, onAttach),
    componentId = state[scope].vars.create(
      '$_component',
      scope === 'render' ? runtime.memo(component) : component,
    ).name;

  state.result = componentId;
  parent?.children.push(componentId);
  state.node = parent;
}

function createListenersCallback(node: ComponentNode, { domRuntime }: ReactTransformState) {
  if (!node.events) return;

  const id = $.id('instance');

  return $.arrowFn(
    [id],
    node.events.map((event) => domRuntime.listen(id, event.type, event.initializer, event.capture)),
  );
}
