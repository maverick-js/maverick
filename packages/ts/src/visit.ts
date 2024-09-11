import ts from 'typescript';

export function walkTsNode(node: ts.Node, check: (child: ts.Node) => any) {
  let result;

  const parse = (child: ts.Node) => {
    result = check(child);
    if (result) return result;
    return ts.forEachChild(child, parse);
  };

  return ts.forEachChild(node, parse);
}
