import t from 'typescript';

export function containsObservableCallExpression(node: t.Node) {
  if (t.isCallExpression(node) || t.isPropertyAccessExpression(node)) {
    return true;
  }

  let found = false;

  const visit = (node: t.Node) => {
    if (t.isCallExpression(node) || t.isPropertyAccessExpression(node)) {
      return (found = true);
    }

    return t.forEachChild(node, visit);
  };

  t.forEachChild(node, visit);
  return found;
}
