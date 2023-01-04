import { createElementInstance } from './instance';
import { MOUNT, MOUNTED, SCOPE } from './internal';
import type { CustomElementDefinition, HTMLCustomElement } from './types';

/**
 * This function is dynamically imported and used to setup when there is no delegate (i.e., no
 * host framework such as loading over a CDN).
 */
export async function setup($el: HTMLCustomElement) {
  const parent = findParent($el);

  const ctor = $el.constructor as any,
    definition = ctor._definition as CustomElementDefinition;

  // Wait for parent custom element to be defined and mounted.
  if (parent) {
    await customElements.whenDefined(parent.localName);
    parent[MOUNTED] || (await new Promise((res) => (parent[MOUNT] ??= []).push(res)));
  }

  // Skip setting up if we disconnected while waiting for parent to mount.
  if ($el.isConnected) {
    // Create instance and attach parent scope.
    const instance = createElementInstance(definition, {
      props: resolvePropsFromAttrs($el),
      scope: parent?.instance![SCOPE]!,
    });

    $el.attachComponent(instance);
  }
}

function resolvePropsFromAttrs($el: HTMLCustomElement): Record<string, any> {
  const ctor = $el.constructor as any,
    props = {};

  if (!ctor._attrToProp) return props;

  for (const attrName of ctor._attrToProp.keys()) {
    if ($el.hasAttribute(attrName)) {
      const propName = ctor._attrToProp.get(attrName)!;
      const convert = ctor._definition.props![propName].type?.from;
      if (convert) {
        const attrValue = $el.getAttribute(attrName);
        props[propName] = convert(attrValue);
      }
    }
  }

  return props;
}

function findParent($el: HTMLCustomElement): HTMLCustomElement | null {
  let ctor = $el.constructor as any,
    node: Node | null = $el.parentNode,
    prefix = ctor._definition.tagName.split('-', 1)[0] + '-';

  while (node) {
    if (node.nodeType === 1 && (node as Element).localName.startsWith(prefix)) {
      return node as HTMLCustomElement;
    }

    node = node.parentNode;
  }

  return null;
}
