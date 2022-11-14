import ts from 'typescript';

import {
  getPropertyAssignmentValue,
  getReturnExpression,
  getValueNode,
  walkProperties,
} from '../utils/walk';
import { type MembersMeta, type MethodMeta, type PropMeta } from './component';
import { buildMethodMeta } from './methods';
import { buildPropMeta } from './props';

const ignore = new Set(['$render']);

export function buildMembersMeta(
  checker: ts.TypeChecker,
  root: ts.ObjectLiteralExpression,
): MembersMeta | undefined {
  const props: PropMeta[] = [],
    methods: MethodMeta[] = [],
    setup = getValueNode(checker, getPropertyAssignmentValue(checker, root, 'setup'));

  if (setup) {
    const returnExpression = getReturnExpression(setup);
    const members = returnExpression ? walkProperties(checker, returnExpression) : undefined;
    if (members) {
      for (const [name, node] of members.props) {
        if (!ignore.has(name)) {
          const prop = buildPropMeta(checker, name, node.assignment);
          if (prop) props.push(prop);
        }
      }

      for (const [name, node] of members.accessors) {
        if (node.get) {
          const prop = buildPropMeta(checker, name, node.get);
          if (prop) props.push(prop);
        }
      }

      for (const [name, node] of members.methods) {
        if (!ignore.has(name)) {
          const method = buildMethodMeta(checker, name, node.value);
          if (method) methods.push(method);
        }
      }
    }
  }

  return props.length > 0 || methods.length > 0
    ? {
        props: props.length > 0 ? props : undefined,
        methods: methods.length > 0 ? methods : undefined,
      }
    : undefined;
}
