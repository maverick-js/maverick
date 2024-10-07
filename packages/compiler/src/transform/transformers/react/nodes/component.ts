import { isArray } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';
import ts from 'typescript';

import { type ComponentNode, isExpressionNode } from '../../../../parse/ast';
import { createAttachHostCallback } from '../../dom/nodes/component';
import { createComponentProps, createComponentSlotsObject } from '../../shared/factory';
import type { ReactTransformState, ReactVisitorContext } from '../state';
import { transform } from '../transform';
import { resolveExpressionChild } from './expression';

export function Component(node: ComponentNode, { state }: ReactVisitorContext) {
  const { runtime, domRuntime } = state,
    // Avoid creating a render function wrapper if not needed.
    scope = state.isExpressionChild || state.isSlot ? 'render' : 'setup';

  const parent = state.node;
  state.node = null; // temp remove so slots create new roots.

  const $props = createComponentProps(node);

  const props = !node.spreads
      ? $props
      : domRuntime.mergeProps([...node.spreads.map((s) => s.initializer), $props]),
    propsId = node.spreads
      ? state[scope].vars.create(
          '$_prop',
          scope === 'render' && props ? runtime.memo(props) : props,
        ).name
      : undefined,
    listeners = !propsId
      ? createListenersCallback(node, state)
      : domRuntime.listenCallback(propsId),
    listenerId = propsId
      ? state[scope].vars.create(
          '$_listeners',
          scope === 'render' && listeners ? runtime.memo(listeners) : listeners,
        ).name
      : undefined,
    slots = createComponentSlotsObject(
      node,
      transform,
      (node) => {
        const childState = state.child(node);
        childState.isSlot = true;
        return childState;
      },
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
    onAttach = createAttachHostCallback(node, domRuntime, propsId);

  const component = runtime.component(
      node.name,
      propsId ?? props,
      listenerId ?? listeners,
      slots,
      onAttach,
    ),
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
