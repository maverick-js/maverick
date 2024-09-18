import ts from 'typescript';

export function walkTsNode<T>(node: ts.Node, check: (child: ts.Node) => T): T | void {
  let result: T | void;

  const parse = (child: ts.Node) => {
    result = check(child);
    if (result) return result;
    return ts.forEachChild(child, parse);
  };

  return ts.forEachChild(node, parse);
}
