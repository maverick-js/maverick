import type ts from 'typescript';

import type { SeenMemberSignatures } from '../utils/walk';
import type { MembersMeta, MethodMeta, PropMeta } from './component';
import { buildMethodMeta } from './methods';
import { buildPropMeta } from './props';

export function buildMembersMeta(
  checker: ts.TypeChecker,
  members: SeenMemberSignatures,
): MembersMeta | undefined {
  const props: PropMeta[] = [],
    methods: MethodMeta[] = [];

  for (const [name, node] of members.props) {
    const prop = buildPropMeta(checker, name, undefined, node);
    if (prop) props.push(prop);
  }

  for (const [name, node] of members.methods) {
    const method = buildMethodMeta(checker, name, node);
    if (method) methods.push(method);
  }

  return props.length > 0 || methods.length > 0
    ? {
        props: props.length > 0 ? props : undefined,
        methods: methods.length > 0 ? methods : undefined,
      }
    : undefined;
}
