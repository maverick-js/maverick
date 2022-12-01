import ts from 'typescript';

import { isUndefined } from '../../utils/unit';
import { getDocs } from '../utils/docs';
import { buildTypeMeta, serializeType } from '../utils/types';
import { type MethodMeta, type ParameterMeta, TS_NODE } from './component';
import { getDocTags, hasDocTag } from './doctags';

export function buildMethodMeta(
  checker: ts.TypeChecker,
  name: string,
  node: ts.MethodSignature | ts.MethodDeclaration | ts.FunctionDeclaration,
): MethodMeta | undefined {
  const docs = getDocs(checker, node.name as ts.Identifier),
    doctags = getDocTags(node),
    signature = checker.getSignatureFromDeclaration(node)!,
    returnType = checker.getReturnTypeOfSignature(signature);

  const parameters: ParameterMeta[] = node.parameters
    .filter((parameter) => parameter.type)
    .map((parameter) => ({
      [TS_NODE]: parameter,
      name: (parameter.name as ts.Identifier).escapedText as string,
      type: buildTypeMeta(checker, parameter.type!),
      optional: !isUndefined(parameter.questionToken) ? true : undefined,
      default: parameter.initializer?.getText(),
    }));

  let internal!: MethodMeta['internal'], deprecated!: MethodMeta['deprecated'];

  if (doctags) {
    if (hasDocTag(doctags, 'internal')) internal = true;
    if (hasDocTag(doctags, 'deprecated')) deprecated = true;
  }

  return {
    [TS_NODE]: node,
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
        node,
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
