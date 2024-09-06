import ts from 'typescript';

import { type ComponentNode, isElementNode } from '../../../../parse/ast';
import {
  $,
  createComponentHostProps,
  createComponentProps,
  createComponentSlotsObject,
} from '../../ts-factory';
import { insert } from '../position';
import type { DomTransformState, DomVisitorContext } from '../state';
import { transform } from '../transform';

export function Component(node: ComponentNode, { state, walk }: DomVisitorContext) {
  const { vars, block, runtime } = state;

  const props = createComponentProps(node),
    component = vars.block.component(
      node.name,
      !node.spreads
        ? props
        : runtime.mergeProps([...node.spreads.map((s) => s.initializer), props]),
      createComponentSlotsObject(node, transform, state.child.bind(state)),
      createAttachHostCallback(node, state),
    );

  if (!node.spreads) {
    if (node.events) {
      for (const event of node.events) {
        if (event.forward) {
          block.push(runtime.forwardEvent(component, event.type, event.capture));
        } else {
          block.push(runtime.listen(component, event.type, event.initializer, event.capture));
        }
      }
    }
  }

  const rootElement = walk.path.find(isElementNode);
  if (rootElement) {
    insert(rootElement, component, node, state, walk);
  }
}

function createAttachHostCallback(node: ComponentNode, { runtime }: DomTransformState) {
  const host = $.id('host'),
    block: ts.Expression[] = [];

  if (node.spreads) {
    const props = runtime.mergeProps([
      ...node.spreads.map((s) => s.initializer),
      createComponentHostProps(node),
    ]);

    block.push(runtime.spread(host, props));
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
  }

  return block.length > 0 ? $.arrowFn([host], block) : undefined;
}
