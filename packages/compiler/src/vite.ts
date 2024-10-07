import type ts from 'typescript';
import { createFilter, type FilterPattern, type Plugin } from 'vite';

import { transform, type TransformOptions } from './transform/transform';
import type { Transform, TransformData } from './transform/transformers/transformer';

export interface MaverickOptions extends Omit<TransformOptions, 'filename' | 'transform'> {
  /**
   * A [picomatch](https://github.com/micromatch/picomatch) pattern, or array of patterns, which
   * specifies the files the plugin should operate on.
   *
   * @defaultValue /\.(jsx|tsx)/
   */
  include?: FilterPattern;
  /**
   * A [picomatch](https://github.com/micromatch/picomatch) pattern, or array of patterns, which
   * specifies the files to be ignored by the plugin.
   */
  exclude?: FilterPattern;
  /**
   * A function which takes a `ts.SourceFile` and transforms all JSX blocks.
   */
  transform: Transform | ContextualTransform;
}

export interface ContextualTransform {
  (data: TransformData, context: TransformContext): ts.SourceFile;
}

export interface TransformContext {
  id: string;
  code: string;
  ssr?: boolean;
}

export function maverick({
  include,
  exclude,
  transform: $transform,
  ...options
}: MaverickOptions): Plugin {
  const filter = createFilter(include ?? /\.(jsx|tsx)/, exclude);
  return {
    name: 'maverick.js',
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          entries: [
            'maverick.js',
            '@maverick-js/signals',
            '@maverick-js/std',
            '@maverick-js/element',
            '@maverick-js/dom',
            '@maverick-js/ssr',
            '@maverick-js/react',
          ],
        },
      };
    },
    transform(code, id, { ssr } = {}) {
      if (!filter(id)) return;
      return transform(code, {
        ...options,
        filename: id,
        transform(data) {
          return $transform(data, { id, code, ssr });
        },
      });
    },
  };
}
