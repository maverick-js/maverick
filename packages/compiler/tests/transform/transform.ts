import {
  domTransformer,
  type DomTransformOptions,
  reactTransformer,
  ssrTransformer,
  type SsrTransformOptions,
  transform,
  type TransformOptions,
} from '@maverick-js/compiler';

type DomOptions = TransformOptions & DomTransformOptions;

export function dom(
  code: string,
  { customElements, hydratable, ...options }: Partial<DomOptions> = {},
) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: domTransformer({ customElements, hydratable }),
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

type ReactOptions = TransformOptions;

export function react(code: string, options: Partial<ReactOptions> = {}) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: reactTransformer(),
    ...options,
  }).code;
}
