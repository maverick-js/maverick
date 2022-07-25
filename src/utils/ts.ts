import t from 'typescript';

export function containsCallExpression(node: t.Node) {
  if (t.isCallExpression(node)) return true;

  let found = false;

  const visit = (node: t.Node) => {
    if (t.isCallExpression(node)) return (found = true);
    return t.forEachChild(node, visit);
  };

  t.forEachChild(node, visit);
  return found;
}
