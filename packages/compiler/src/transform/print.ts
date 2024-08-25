import ts from 'typescript';

export const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export function printNode(node: ts.Node, sourceFile: ts.SourceFile) {
  return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}

export function printFile(sourceFile: ts.SourceFile) {
  return printer.printFile(sourceFile);
}
