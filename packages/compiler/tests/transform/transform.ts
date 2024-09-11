import {
  domTransformer,
  elementTransformer,
  ssrTransformer,
  transform,
  type TransformOptions,
} from '@maverick-js/compiler';

export function dom(code: string, options?: Partial<TransformOptions>) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: domTransformer(),
    ...options,
  }).code;
}

export function domH(code: string, options?: Partial<TransformOptions>) {
  return dom(code, { ...options, hydratable: true });
}

export function ssr(code: string, options?: Partial<TransformOptions>) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: ssrTransformer(),
    ...options,
  }).code;
}

export function ssrH(code: string, options?: Partial<TransformOptions>) {
  return ssr(code, { hydratable: true, ...options });
}

export function element(code: string, options?: Partial<TransformOptions>) {
  return transform(code, {
    filename: 'test.tsx',
    transformer: elementTransformer(),
    ...options,
  }).code;
}
