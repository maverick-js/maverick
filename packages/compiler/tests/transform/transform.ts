import {
  createDomTransform,
  createReactTransform,
  createSsrTransform,
  type DomTransformOptions,
  type ReactTransformOptions,
  type SsrTransformOptions,
  transform,
} from '@maverick-js/compiler';

export function dom(code: string, options: DomTransformOptions = {}) {
  return transform(code, {
    filename: 'test.tsx',
    transform: createDomTransform(options),
  }).code;
}

export function domH(code: string, options?: DomTransformOptions) {
  return dom(code, { ...options, hydratable: true });
}

export function ssr(code: string, options?: SsrTransformOptions) {
  return transform(code, {
    filename: 'test.tsx',
    transform: createSsrTransform(options),
  }).code;
}

export function react(code: string, options?: ReactTransformOptions) {
  return transform(code, {
    filename: 'test.tsx',
    transform: createReactTransform(options),
  }).code;
}
