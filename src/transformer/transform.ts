import MagicString, { type SourceMapOptions } from 'magic-string';
import path from 'path';

import {
  log,
  LogLevel,
  type LogLevelName,
  logTime,
  mapLogLevelStringToNumber,
  setGlobalLogLevel,
} from '../utils/logger';
import { createImportDeclaration, Declarations, format } from '../utils/print';
import { type AST } from './ast';
import { dom } from './dom';
import { parseJSX } from './jsx/parse-jsx';
import { overwrite } from './jsx/utils';
import { ssr } from './ssr';

export type TransformOptions = {
  logLevel: LogLevelName;
  filename: string;
  hydratable: boolean;
  pretty: boolean;
  sourcemap: boolean | SourceMapOptions;
  generate: 'dom' | 'ssr' | false;
};

export type TransformContext = {
  scoped: boolean;
  globals: Declarations;
  runtime: Set<string>;
  hydratable: boolean;
};

export type ASTSerializer = {
  serialize(ast: AST, context: TransformContext): string;
};

export function transform(source: string, options: Partial<TransformOptions> = {}) {
  const {
    filename = '',
    sourcemap,
    generate,
    pretty = true,
    hydratable = false,
    logLevel = 'warn',
  } = options;

  const SSR = generate === 'ssr';

  if (logLevel) setGlobalLogLevel(mapLogLevelStringToNumber(logLevel));

  log(() => `Transforming ${path.relative(process.cwd(), filename)}`, LogLevel.Info);
  log(options, LogLevel.Verbose);

  const code = new MagicString(source);

  const astStartTime = process.hrtime();
  const { startPos, ast } = parseJSX(code, options);
  logTime('Built AST', astStartTime, LogLevel.Info);

  const ctx: TransformContext = {
    scoped: true,
    globals: new Declarations(),
    runtime: new Set(),
    hydratable,
  };

  const serialize = (SSR ? ssr : dom).serialize;

  const serializeStartTime = process.hrtime();
  for (const _ast of ast) {
    overwrite(
      code,
      _ast.root,
      // slice of ;\n from end
      pretty ? format(filename, serialize(_ast, ctx)).slice(0, -2) : serialize(_ast, ctx),
    );
  }
  logTime('Serialized AST', serializeStartTime, LogLevel.Info);

  if (ctx.runtime.size > 0) {
    code.prepend(
      createImportDeclaration(null, Array.from(ctx.runtime), `maverick.js/${generate ?? 'dom'}`),
    );
  }

  if (ctx.globals.size > 0) {
    const seen = new Set();
    for (const [id, value] of ctx.globals.all) {
      if (!seen.has(id)) {
        for (const [idTwo, valueTwo] of ctx.globals.all) {
          if (id !== idTwo && value === valueTwo) {
            ctx.globals.update(idTwo, id);
            seen.add(idTwo);
          }
        }
      }
    }

    code.appendRight(startPos, `${startPos === 0 ? '\n' : '\n\n'}${ctx.globals.serialize(true)}`);
  }

  log(() => `Result:\n\n${code}`, LogLevel.Verbose);

  return {
    code: code.toString(),
    map: sourcemap
      ? code.generateMap(
          typeof sourcemap === 'boolean'
            ? { source: filename, file: filename, hires: true }
            : { source: filename, hires: true, ...sourcemap },
        )
      : null,
  };
}
