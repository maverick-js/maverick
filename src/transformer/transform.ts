import MagicString, { type SourceMapOptions } from 'magic-string';
import { dom } from './dom';
import { ssr } from './ssr';
import { Stats } from '../utils/stats';
import { parseJSX } from './jsx/parse-jsx';
import { type AST } from './ast';
import { overwrite } from './jsx/utils';
import {
  createFunctionCall,
  createScopedDeclarations,
  createStringArray,
  type ScopedDeclarations,
} from '../utils/print';
import { log, LogLevel, logStats, setGlobalLogLevel } from '../utils/logger';

const DELEGATE_EVENTS_ID = '$$_delegate_events';

export type TransformOptions = {
  stats: boolean;
  filename: string;
  logLevel: LogLevel;
  dev: boolean;
  hydratable: boolean;
  sourcemap: boolean | SourceMapOptions;
  generate: 'dom' | 'ssr' | false;
};

export type TransformContext = {
  dev: boolean;
  hydratable: boolean;
  declarations: ScopedDeclarations;
  delegateEvents: Set<string>;
  runtimeImports: Set<string>;
  meta: Record<string, any>;
};

export type ASTSerializer = {
  serialize(ast: AST, context: TransformContext): string;
};

export function transform(source: string, options: Partial<TransformOptions> = {}) {
  const { filename, sourcemap, generate, stats: collectStats, logLevel = LogLevel.Warn } = options;
  const SSR = generate === 'ssr';
  const stats = collectStats ? new Stats() : null;

  setGlobalLogLevel(logLevel);

  stats?.start('ast');
  const [startPos, ast] = parseJSX(source, { ...options, stats });
  stats?.stop('ast');

  const code = new MagicString(source);

  const ctx: TransformContext = {
    dev: options.dev ?? false,
    hydratable: options.hydratable ?? false,
    declarations: createScopedDeclarations(),
    delegateEvents: new Set(),
    runtimeImports: new Set(),
    meta: {},
  };

  const serialize = (SSR ? ssr : dom).serialize;

  stats?.start('serialize');
  for (const _ast of ast) overwrite(code, _ast.root, serialize(_ast, ctx));
  stats?.stop('serialize');

  const hasDelegateEvents = ctx.delegateEvents.size > 0;

  if (hasDelegateEvents) {
    log(`Delegate Events: ${ctx.delegateEvents}`, LogLevel.Verbose);
    ctx.runtimeImports.add(DELEGATE_EVENTS_ID);
  }

  if (ctx.runtimeImports.size > 0) {
    log(`Runtime Imports: ${ctx.runtimeImports}`, LogLevel.Verbose);
    const runtimeImports = `import { ${Array.from(ctx.runtimeImports).join(
      ', ',
    )} } from "@maverick-js/elements/runtime";`;
    code.prepend(runtimeImports);
  }

  if (ctx.declarations.all.size > 0) {
    const declarations = ctx.declarations.serialize(true);
    code.appendRight(startPos, `\n\n${declarations}`);
  }

  if (hasDelegateEvents) {
    const events = Array.from(ctx.delegateEvents);
    code.append(`\n\n${createFunctionCall(DELEGATE_EVENTS_ID, [createStringArray(events)])}`);
  }

  if (stats) logStats(stats, LogLevel.Verbose);

  return {
    stats: options.stats,
    code: code.toString(),
    map: sourcemap
      ? code.generateMap(
          typeof sourcemap === 'boolean'
            ? { source: filename }
            : { source: filename, ...sourcemap },
        )
      : null,
  };
}
