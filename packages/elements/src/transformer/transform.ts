import MagicString, { type SourceMapOptions } from 'magic-string';
import { dom } from './dom';
import { ssr } from './ssr';
import Stats from './stats';
import { parseJSX } from './jsx/parse-jsx';
import { type AST } from './ast';
import { overwrite } from './jsx/utils';
import { createScopedDeclarations, type ScopedDeclarations } from './utils';

export type TransformOptions = {
  stats: Stats;
  filename: string;
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
};

export type ASTSerializer = {
  serialize(ast: AST, context: TransformContext): string;
};

export function transform(source: string, options: Partial<TransformOptions> = {}) {
  const { sourcemap, generate } = options;
  const SSR = generate === 'ssr';

  options.stats?.start('ast');
  const ast = parseJSX(source, options);
  options.stats?.stop('ast');

  const code = new MagicString(source);

  const ctx: TransformContext = {
    dev: options.dev ?? false,
    hydratable: options.hydratable ?? false,
    declarations: createScopedDeclarations(),
    delegateEvents: new Set(),
    runtimeImports: new Set(),
  };

  const serialize = (SSR ? ssr : dom).serialize;

  options.stats?.start('serialize');
  for (const _ast of ast) overwrite(code, _ast.root, serialize(_ast, ctx));
  options.stats?.stop('serialize');

  console.log(ctx.declarations.all);

  // if (hasEvents) {
  //   context.runtimeImports.add('$delegate_events');
  // }

  // TODO: process templates off ast -> runTime `template` +  /*#__PURE__*/ + hydratable
  // if (context.templates.size > 0) {
  //   if (lastImportNode) {
  //     insertAfter(code, lastImportNode, templates);
  //   } else {
  //     code.prepend(templates);
  //   }
  // }

  // if (context.runtimeImports.size > 0) {
  //   const runtimeImports = Array.from(context.runtimeImports);
  //   code.prepend(
  //     newLineEnd(createImportDeclaration(null, runtimeImports, '@maverick-js/elements/runtime')),
  //   );
  // }

  // if (hasEvents) {
  //   const events = Array.from(context.events);
  //   code.append(
  //     newLinesAround(createFunctionCall('delegateEvents', [createStringArray(events)])),
  //   );
  // }

  return {
    stats: options.stats,
    code: code.toString(),
    map: sourcemap ? code.generateMap(typeof sourcemap === 'boolean' ? {} : sourcemap) : null,
  };
}
