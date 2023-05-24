import type { ComponentConstructor } from './component';
import type { HTMLCustomElement } from './host';
import { createComponent } from './instance';
import { CONNECT } from './internal';

/**
 * This function is dynamically imported and used to setup when there is no delegate (i.e., no
 * host framework such as loading over a CDN).
 */
export async function setup(host: HTMLCustomElement<any>) {
  const parent = findParent(host);

  const hostCtor = host.constructor as any,
    componentCtor = hostCtor._component as ComponentConstructor;

  // Wait for parent custom element to be defined and connected.
  if (parent) {
    await customElements.whenDefined(parent.localName);
    parent[CONNECT] === true || (await new Promise((res) => parent[CONNECT].push(res)));
  }

  // Skip setting up if we disconnected while waiting for parent to connect.
  if (host.isConnected) {
    if (parent?.keepAlive) host.keepAlive = true;
    host.attachComponent(
      createComponent(componentCtor, {
        scope: parent?.component?.instance!._scope,
      }),
    );
  }
}

export function resolvePropsFromAttrs(host: HTMLCustomElement<any>): Record<string, any> {
  const hostCtor = host.constructor as any,
    componentCtor = hostCtor._component as ComponentConstructor,
    props = {};

  if (!hostCtor._attrs) return props;

  for (const attr of host.attributes) {
    let propName = hostCtor._attrs.get(attr.name),
      convert = propName && componentCtor.el.props![propName].type?.from;
    if (convert) {
      let attrValue = host.getAttribute(attr.name);
      props[propName] = convert(attrValue);
    }
  }

  return props;
}

export function findParent(host: HTMLCustomElement<any>): HTMLCustomElement<any> | null {
  let hostCtor = host.constructor as any,
    componentCtor = hostCtor._component as ComponentConstructor,
    node: Node | null = host.parentNode,
    prefix = componentCtor.el.tagName.split('-', 1)[0] + '-';

  while (node) {
    if (node.nodeType === 1 && (node as Element).localName.startsWith(prefix)) {
      return node as HTMLCustomElement;
    }

    node = node.parentNode;
  }

  return null;
}
