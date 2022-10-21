import { renderToString } from '../runtime/ssr';
import { noop } from '../utils/unit';
import type { ElementDefinition, ElementSetupContext, MaverickHost } from './types';

export function createSSRElement(definition: ElementDefinition) {
  if (definition.shadow) {
    throw Error('[maverick] shadow DOM SSR is not supported yet');
  }

  const tagName = definition.tagName.toLowerCase();

  return ({ props, context, children }: ElementSetupContext) => {
    const attrs = new Map<string, string>();

    const ssr = renderToString(() => {
      // TODO: wire up props
      const $$props = {};
      // TODO: define setup props in here (getters)

      // TODO: should be proxy - throw error any unknown DOM api
      const host: MaverickHost = {
        $keepAlive: false,
        get $tagName() {
          return tagName;
        },
        get $children() {
          return !!children?.();
        },
        get $connected() {
          return false;
        },
        get $mounted() {
          return false;
        },
        $setup: () => noop,
        $destroy: noop,
      };

      // TODO: also any set attrs/classes/styles/cssvars
      // set class+style on attrs

      // dispatchEvent -> noop (JSX.GLobalOnAttributes)
      // MaverickElement -- override {add,remove}EventListener and dispatchEvent??

      // TODO: add `data-hydrate` + `data-delegate`? -> must be if SSR?

      const members = definition.setup({
        host: host as any,
        props: $$props,
        context,
        dispatch: () => false,
        ssr: true,
      });

      return members.$render();
    }).code;

    const attributes = renderAttrsToString(attrs);
    const innerHTML = `<!--#internal-->${ssr}<!--/#internal-->`;

    return {
      attributes,
      innerHTML,
      code: `<${tagName}${attributes}>${innerHTML}</${tagName}>`,
    };
  };
}

export function renderAttrsToString(attrs: Map<string, string>) {
  if (attrs.size === 0) return '';
  let result: string[] = [];
  for (const [key, value] of attrs) result.push(`${key}="${value}"`);
  return ' ' + result.join(' ');
}
