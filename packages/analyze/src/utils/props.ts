import ts from 'typescript';

export function getStaticProp(
  node: ts.ClassDeclaration,
  name: string,
): ts.PropertyDeclaration | undefined {
  return (node.members.find(
    (member) =>
      ts.isPropertyDeclaration(member) &&
      member.modifiers &&
      member.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
      ts.isIdentifier(member.name) &&
      member.name.escapedText === name,
  ) || null) as ts.PropertyDeclaration | undefined;
}
