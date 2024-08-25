import { domTransformer, transform, type TransformOptions } from '@maverick-js/compiler';

export function t(code: string, options?: Partial<TransformOptions>) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: domTransformer(),
    ...options,
  }).code;
}

export function h(code: string, options?: Partial<TransformOptions>) {
  return t(code, {
    ...options,
    hydratable: true,
  });
}
