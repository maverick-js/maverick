import {
  domTransformer,
  type DomTransformOptions,
  ssrTransformer,
  type SsrTransformOptions,
  transform,
  type TransformOptions,
} from '@maverick-js/compiler';

type DomOptions = TransformOptions & DomTransformOptions;

export function dom(code: string, { customElements, ...options }: Partial<DomOptions> = {}) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: domTransformer({ customElements }),
    ...options,
  }).code;
}

export function domH(code: string, options?: Partial<DomOptions>) {
  return dom(code, { ...options, hydratable: true });
}

type SsrOptions = TransformOptions & SsrTransformOptions;

export function ssr(code: string, { customElements, ...options }: Partial<SsrOptions> = {}) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: ssrTransformer({ customElements }),
    ...options,
  }).code;
}

export function ssrH(code: string, options?: Partial<SsrTransformOptions>) {
  return ssr(code, { hydratable: true, ...options });
}
