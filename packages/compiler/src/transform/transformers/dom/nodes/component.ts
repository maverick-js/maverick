import { $, getUniqueId } from '@maverick-js/ts';
import ts from 'typescript';

import { type ComponentNode, isElementNode } from '../../../../parse/ast';
import {
  createComponentHostProps,
  createComponentProps,
  createComponentSlotsObject,
  createEventPropertyAssignmentList,
} from '../../shared/factory';
import { insert } from '../position';
import type { DomRuntime } from '../runtime';
import type { DomTransformState, DomVisitorContext } from '../state';
import { transform } from '../transform';

export function Component(node: ComponentNode, { state, walk }: DomVisitorContext) {
  const { vars, runtime } = state;

  const name = $.id(node.name);
  state.args.push(name);

  const rootElement = walk.path.find(isElementNode),
    marker = state.hydratable && rootElement ? state.vars.setup.nextNode(state.walker!) : null;

  const props = createComponentProps(node),
    mergedSpreadPropsId = node.spreads
      ? vars.setup.create(
          '$$_merged_props',
          runtime.mergeProps([...node.spreads.map((s) => s.initializer), props]),
        ).name
      : null,
    component = vars.setup.component(
      getUniqueId(name),
      !mergedSpreadPropsId ? props : mergedSpreadPropsId,
      !mergedSpreadPropsId
        ? createEventListener(node, state)
        : runtime.listenCallback(
            mergedSpreadPropsId,
            node.events
              ? $.object(createEventPropertyAssignmentList(node.events), true)
              : undefined,
          ),
      createComponentSlotsObject(node, transform, (node) => state.child(node)),
      createAttachHostCallback(node, state.runtime, mergedSpreadPropsId),
    );

  if (rootElement) {
    insert(rootElement, component, node, state, walk, marker);
  }

  if (state.result === $.null) {
    state.result = component;
  }
}

export function createEventListener(node: ComponentNode, state: DomTransformState) {
  if (!node.events) return;

  const { runtime } = state,
    targetId = $.createUniqueName('$_target'),
    body: ts.Expression[] = [];

  for (const event of node.events) {
    body.push(runtime.listen(targetId, event.type, event.initializer, event.capture));
  }

  return $.arrowFn([targetId], body);
}

export function createAttachHostCallback(
  node: ComponentNode,
  runtime: DomRuntime,
  spreadId?: ts.Expression | null,
) {
  const host = $.id('host'),
    block: ts.Expression[] = [];

  if (node.spreads || spreadId) {
    const props = spreadId
      ? spreadId
      : runtime.mergeProps([
          ...node.spreads!.map((s) => s.initializer),
          createComponentHostProps(node),
        ]);

    block.push(runtime.hostSpread(host, props));
  } else {
    if (node.class) {
      block.push(runtime.appendClass(host, node.class.initializer));
    }

    if (node.classes) {
      for (const c of node.classes) {
        block.push(runtime.class(host, c.name, c.initializer));
      }
    }

    if (node.vars) {
      for (const cssvar of node.vars) {
        block.push(runtime.style(host, `--${cssvar.name}`, cssvar.initializer));
      }
    }

    if (node.ref) {
      block.push(runtime.ref(host, node.ref.initializer));
    }
  }

  return block.length > 0 ? $.arrowFn([host], block) : undefined;
}
