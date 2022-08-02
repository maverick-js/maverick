import MagicString, { type SourceMapOptions } from 'magic-string';
import { dom } from './dom';
import { ssr } from './ssr';
import { parseJSX } from './jsx/parse-jsx';
import { type AST } from './ast';
import { overwrite } from './jsx/utils';
import {
  log,
  LogLevel,
  type LogLevelName,
  setGlobalLogLevel,
  mapLogLevelStringToNumber,
  logTime,
} from '../utils/logger';
import { createImportDeclaration, Declarations, format } from '../utils/print';
import path from 'path';

export type TransformOptions = {
  logLevel: LogLevelName;
  filename: string;
  hydratable: boolean;
  pretty: boolean;
  sourcemap: boolean | SourceMapOptions;
  generate: 'dom' | 'ssr' | false;
};

export type TransformContext = {
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

  const astStartTime = process.hrtime();
  const [startPos, ast] = parseJSX(source, options);
  logTime('Built AST', astStartTime, LogLevel.Info);

  const code = new MagicString(source);

  const ctx: TransformContext = {
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
      createImportDeclaration(
        null,
        Array.from(ctx.runtime),
        `@maverick-js/elements/${generate ?? 'dom'}`,
      ),
    );
  }

  if (ctx.globals.size > 0) {
    code.appendRight(startPos, `${startPos === 0 ? '\n' : '\n\n'}${ctx.globals.serialize(true)}`);
  }

  log(() => `Result:\n\n${code}`, LogLevel.Verbose);

  return {
    code: code.toString(),
    map: sourcemap
      ? code.generateMap(
          typeof sourcemap === 'boolean'
            ? { source: filename, file: filename }
            : { source: filename, ...sourcemap },
        )
      : null,
  };
}
