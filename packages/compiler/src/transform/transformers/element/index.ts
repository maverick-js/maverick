import { domTransformer } from '../dom';
import type { Transformer } from '../transformer';

export function elementTransformer(): Transformer {
  const dom = domTransformer({ customElements: true });
  return {
    name: '@maverick-js/element',
    transform(data) {
      return dom.transform(data);
    },
  };
}
