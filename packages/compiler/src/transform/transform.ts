import { isUndefined } from '@maverick-js/std';
import MagicString, { type SourceMapOptions } from 'magic-string';
import { relative } from 'pathe';
import type ts from 'typescript';

import type { ParseAnalysis } from '../parse/analysis';
import { parse } from '../parse/parse';
import {
  log,
  LogLevel,
  type LogLevelName,
  logTime,
  mapLogLevelStringToNumber,
  setGlobalLogLevel,
} from '../utils/logger';
import { printFile } from './print';
import type { Transformer } from './transformers/transformer';
import { removeImports, type TsNodeMap } from './transformers/ts-factory';

export interface TransformOptions {
  transformer: Transformer;
  logLevel?: LogLevelName;
  filename: string;
  hydratable?: boolean;
  sourcemap?: boolean | SourceMapOptions;
  /** @default true */
  delegateEvents?: boolean;
}

export interface TransformContext {
  readonly analysis: Readonly<ParseAnalysis>;
  /** User provided transform options. */
  readonly options: Readonly<TransformOptions>;
}

export function transform(source: string, options: TransformOptions) {
  const { transformer, logLevel = 'warn', filename, sourcemap = true } = options;

  setGlobalLogLevel(mapLogLevelStringToNumber(logLevel));

  log(() => `Transforming ${relative(process.cwd(), filename)}`, LogLevel.Info);
  log(options, LogLevel.Verbose);

  // Build AST
  let astStartTime = process.hrtime(),
    { analysis, sourceFile, nodes } = parse(source, options);

  logTime({ message: 'Built AST', startTime: astStartTime }, LogLevel.Info);

  if (isUndefined(options.delegateEvents)) {
    options.delegateEvents = true;
  }

  const virtualImports = Object.values(analysis.components).filter(Boolean) as ts.ImportSpecifier[];
  if (virtualImports.length) {
    sourceFile = removeImports(sourceFile, virtualImports);
  }

  const ctx: TransformContext = {
    analysis,
    options,
  };

  // Transform JSX
  const transformStartTime = process.hrtime(),
    transformedFile = transformer.transform({ sourceFile, nodes, ctx }),
    code = new MagicString(source).overwrite(0, source.length, printFile(transformedFile));

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
