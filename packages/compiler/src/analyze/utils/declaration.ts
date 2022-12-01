import ts from 'typescript';

export function getDeclarations(
  checker: ts.TypeChecker,
  identifier: ts.Identifier,
): ts.Declaration[] | undefined {
  if (
    identifier.parent &&
    (ts.isImportClause(identifier.parent) || ts.isImportSpecifier(identifier.parent))
  ) {
    const symbol = checker.getSymbolAtLocation(identifier)!;
    return symbol ? checker.getAliasedSymbol(symbol)?.declarations : undefined;
  } else {
    const declarations = checker.getSymbolAtLocation(identifier)?.declarations;
    const declaration = declarations?.[0];

    if (
      declaration &&
      (ts.isImportClause(declaration) || ts.isImportSpecifier(declaration)) &&
      declaration.name &&
      ts.isIdentifier(declaration.name)
    ) {
      const symbol = checker.getSymbolAtLocation(declaration.name)!;
      return symbol ? checker.getAliasedSymbol(symbol)?.declarations : undefined;
    }

    return declarations;
  }
}

export function getDeclaration(
  checker: ts.TypeChecker,
  identifier: ts.Identifier,
): ts.Declaration | undefined {
  return getDeclarations(checker, identifier)?.[0];
}

export function getShorthandAssignmentDeclaration(
  checker: ts.TypeChecker,
  node: ts.ShorthandPropertyAssignment,
): ts.Declaration | undefined {
  const symbol = checker.getShorthandAssignmentValueSymbol(node);
  const declaration = symbol?.declarations?.[0] as ts.VariableDeclaration;
  return declaration?.name && ts.isIdentifier(declaration.name)
    ? getDeclaration(checker, declaration.name)
    : undefined;
}
