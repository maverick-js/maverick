import ts from 'typescript';

import { normalizeLineBreaks } from '../../utils/print';

export function getDocs(checker: ts.TypeChecker, id: ts.Identifier): string | undefined {
  const comment = checker.getSymbolAtLocation(id)?.getDocumentationComment(checker);
  const str = ts.displayPartsToString(comment);
  return str ? normalizeLineBreaks(str) : undefined;
}
