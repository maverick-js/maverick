import MagicString, { type SourceMapOptions } from 'magic-string';
import { dom } from './dom';
import { ssr } from './ssr';
import { Stats } from '../utils/stats';
import { parseJSX } from './jsx/parse-jsx';
import { type AST } from './ast';
import { overwrite } from './jsx/utils';
import {
  log,
  LogLevel,
  type LogLevelName,
  logStats,
  setGlobalLogLevel,
  mapLogLevelStringToNumber,
} from '../utils/logger';
import {
  createFunctionCall,
  createImportDeclaration,
  createStringArray,
  Declarations,
  format,
} from '../utils/print';

const DELEGATE_EVENTS_ID = '$$_delegate_events';

export type TransformOptions = {
  logLevel: LogLevelName;
  filename: string;
  stats: boolean;
  sourcemap: boolean | SourceMapOptions;
  generate: 'dom' | 'ssr' | false;
};

export type TransformContext = {
  globals: Declarations;
  runtime: Set<string>;
  delegates: Set<string>;
};

export type ASTSerializer = {
  serialize(ast: AST, context: TransformContext): string;
};

export function transform(source: string, options: Partial<TransformOptions> = {}) {
  const { filename = '', sourcemap, generate, stats: collectStats, logLevel = 'warn' } = options;
  const SSR = generate === 'ssr';
  const stats = collectStats ? new Stats() : null;

  if (logLevel) setGlobalLogLevel(mapLogLevelStringToNumber(logLevel));

  stats?.start('ast');
  const [startPos, ast] = parseJSX(source, { ...options, stats });
  stats?.stop('ast');

  const code = new MagicString(source);

  const ctx: TransformContext = {
    globals: new Declarations(),
    runtime: new Set(),
    delegates: new Set(),
  };

  const serialize = (SSR ? ssr : dom).serialize;

  stats?.start('serialize');
  for (const _ast of ast) {
    // Slice of ;\n from end
    overwrite(code, _ast.root, format(filename, serialize(_ast, ctx)).slice(0, -2));
  }
  stats?.stop('serialize');

  const hasDelegateEvents = ctx.delegates.size > 0;

  if (hasDelegateEvents) {
    log(`Delegate Events: ${ctx.delegates}`, LogLevel.Verbose);
    ctx.runtime.add(DELEGATE_EVENTS_ID);
  }

  if (ctx.runtime.size > 0) {
    log(`Runtime Imports: ${ctx.runtime}`, LogLevel.Verbose);
    code.prepend(
      createImportDeclaration(
        null,
        Array.from(ctx.runtime),
        `@maverick-js/elements/${generate ?? 'dom'}`,
      ),
    );
  }

  if (ctx.globals.size > 0) {
    code.appendRight(startPos, `\n\n${ctx.globals.serialize(true)}`);
  }

  if (hasDelegateEvents) {
    const events = Array.from(ctx.delegates);
    code.append(`\n\n${createFunctionCall(DELEGATE_EVENTS_ID, [createStringArray(events)])}`);
  }

  if (stats) logStats(stats, LogLevel.Verbose);

  return {
    stats: options.stats,
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
