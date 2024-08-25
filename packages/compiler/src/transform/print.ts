import ts from 'typescript';

export const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export function printNode(node: ts.Node, sourceFile: ts.SourceFile) {
  printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

export function createId(name: string) {
  return ts.factory.createIdentifier(name);
}

export function createImports(specifiers: string[], module: string, isTypeOnly = false) {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      isTypeOnly,
      undefined,
      ts.factory.createNamedImports(
        specifiers.map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name)),
        ),
      ),
    ),
    ts.factory.createStringLiteral(module),
  );
}
