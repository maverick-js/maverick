import ts from 'typescript';

import { isUndefined } from '../../utils/unit';
import { getDocs } from '../utils/docs';
import { buildTypeMeta, serializeType } from '../utils/types';
import type { MethodMeta, ParameterMeta } from './component';
import { getDocTags, hasDocTag } from './doctags';
import { TS_NODE } from './symbols';

export interface MethodMetaInfo {
  type: ts.Type;
}

export function buildMethodMeta(
  checker: ts.TypeChecker,
  name: string,
  declaration: ts.MethodSignature | ts.MethodDeclaration | ts.FunctionDeclaration,
  info: MethodMetaInfo,
): MethodMeta {
  const docs = getDocs(checker, declaration.name as ts.Identifier),
    doctags = getDocTags(declaration),
    signature = checker.getSignatureFromDeclaration(declaration)!,
    returnType = checker.getReturnTypeOfSignature(signature);

  const parameters: ParameterMeta[] = declaration.parameters
    .filter((parameter) => parameter.type)
    .map((parameter) => ({
      [TS_NODE]: parameter,
      name: (parameter.name as ts.Identifier).escapedText as string,
      type: buildTypeMeta(checker, checker.getTypeAtLocation(parameter)),
      optional: !isUndefined(parameter.questionToken) ? true : undefined,
      default: parameter.initializer?.getText(),
    }));

  let internal!: MethodMeta['internal'], deprecated!: MethodMeta['deprecated'];

  if (doctags) {
    if (hasDocTag(doctags, 'internal')) internal = true;
    if (hasDocTag(doctags, 'deprecated')) deprecated = true;
  }

  return {
    [TS_NODE]: declaration,
    name,
    docs,
    doctags,
    internal,
    deprecated,
    parameters,
    signature: {
      [TS_NODE]: signature,
      type: checker.signatureToString(
        signature,
        declaration,
        ts.TypeFormatFlags.WriteArrowStyleSignature | ts.TypeFormatFlags.NoTruncation,
        ts.SignatureKind.Call,
      ),
    },
    return: {
      [TS_NODE]: returnType,
      type: serializeType(checker, returnType),
    },
  };
}
