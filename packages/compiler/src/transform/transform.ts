import {
  log,
  LogLevel,
  type LogLevelName,
  logTime,
  mapLogLevelStringToNumber,
  setGlobalLogLevel,
} from '@maverick-js/logger';
import { removeImports } from '@maverick-js/ts';
import { relative } from 'pathe';

import type { ParseAnalysis } from '../parse/analysis';
import { parse } from '../parse/parse';
import { printFile } from './print';
import type { Transform } from './transformers/transformer';

export interface TransformOptions {
  transform: Transform;
  logLevel?: LogLevelName;
  filename: string;
}

export interface TransformContext {
  readonly analysis: Readonly<ParseAnalysis>;
  /** User provided transform options. */
  readonly options: Readonly<TransformOptions>;
}

export function transform(source: string, options: TransformOptions) {
  const { transform, logLevel = 'warn', filename } = options;

  setGlobalLogLevel(mapLogLevelStringToNumber(logLevel));

  log(() => `Transforming ${relative(process.cwd(), filename)}`, LogLevel.Info);
  log(options, LogLevel.Verbose);

  // Build AST
  let astStartTime = process.hrtime(),
    { analysis, sourceFile, nodes } = parse(source, options);

  logTime({ message: 'Built AST', startTime: astStartTime }, LogLevel.Info);

  const virtualImports = Object.values(analysis.components);
  if (virtualImports.length > 0) {
    sourceFile = removeImports(sourceFile, '@maverick-js/core', virtualImports);
  }

  const ctx: TransformContext = {
    analysis,
    options,
  };

  // Transform JSX
  const transformStartTime = process.hrtime(),
    transformedFile = transform({ sourceFile, nodes, ctx });

  logTime({ message: `Transformed AST`, startTime: transformStartTime }, LogLevel.Info);

  return { code: printFile(transformedFile) };
}
