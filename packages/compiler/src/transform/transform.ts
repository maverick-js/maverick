import { isString } from '@maverick-js/std';
import MagicString, { type SourceMapOptions } from 'magic-string';
import { relative } from 'pathe';

import { parse } from '../parse/parse';
import {
  log,
  LogLevel,
  type LogLevelName,
  logTime,
  mapLogLevelStringToNumber,
  setGlobalLogLevel,
} from '../utils/logger';
import { getTransformer, type Transformer, type TransformTarget } from './transformers/transformer';

export interface TransformOptions extends TransformFeatures {
  target: TransformTarget | Transformer;
  logLevel?: LogLevelName;
  filename: string;
  hydratable?: boolean;
  sourcemap?: boolean | SourceMapOptions;
  features?: TransformFeatures;
}

export interface TransformFeatures {
  /**
   * Whether to improve performance by delegating expensive events such as pointermove manually.
   */
  delegateEvents?: boolean;
}

export interface TransformContext {
  /** User provided transform options. */
  options: TransformOptions;
}

export function transform(source: string, options: TransformOptions) {
  const { target, logLevel = 'warn', filename, sourcemap = true } = options;

  setGlobalLogLevel(mapLogLevelStringToNumber(logLevel));

  log(() => `Transforming ${relative(process.cwd(), filename)}`, LogLevel.Info);
  log(options, LogLevel.Verbose);

  // Build AST
  const astStartTime = process.hrtime(),
    { sourceFile, jsx } = parse(source, options);

  logTime({ message: 'Built AST', startTime: astStartTime }, LogLevel.Info);

  const ctx: TransformContext = {
    options,
  };

  // Transform JSX
  const code = new MagicString(source),
    transformer = isString(target) ? getTransformer(target) : target,
    transformStartTime = process.hrtime();

  transformer.transform({
    code,
    sourceFile,
    jsx,
    ctx,
  });

  logTime(
    { message: `Transformed AST with [${transformer.name}]`, startTime: transformStartTime },
    LogLevel.Info,
  );

  return {
    code: code.toString(),
    map: sourcemap
      ? code.generateMap(
          typeof sourcemap === 'boolean'
            ? { source: filename, file: filename, hires: true }
            : { source: filename, file: filename, ...sourcemap },
        )
      : null,
  };
}
