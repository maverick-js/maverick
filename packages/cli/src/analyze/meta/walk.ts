import type { ComponentMeta } from './component';
import type { CustomElementMeta } from './custom-element';
import type { ReactComponentMeta } from './react';

const propKeys = new Set(['props', 'callbacks', 'state', 'events', 'cssvars', 'cssparts', 'slots']);

export function walkComponentDocs(
  component: ComponentMeta | CustomElementMeta | ReactComponentMeta,
  callback: (docs: string) => void | string | undefined,
) {
  if (component.docs) {
    const newDocs = callback(component.docs);
    if (newDocs) component.docs = newDocs;
  }

  const keys = Object.keys(component);

  for (const key of keys) {
    if (key === 'members' && component.type === 'component') {
      if (component.members?.props) {
        for (const prop of component.members.props) {
          if (prop.docs) {
            const newDocs = callback(prop.docs);
            if (newDocs) prop.docs = newDocs;
          }
        }

        if (component.members?.methods) {
          for (const method of component.members.methods) {
            if (method.docs) {
              const newDocs = callback(method.docs);
              if (newDocs) method.docs = newDocs;
            }
          }
        }
      }
    } else if (propKeys.has(key)) {
      for (const prop of component[key] as { docs?: string }[]) {
        if (typeof prop.docs === 'string') {
          const newDocs = callback(prop.docs);
          if (newDocs) prop.docs = newDocs;
        }
      }
    }
  }
}
