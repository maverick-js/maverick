import ts from 'typescript';

import { getStaticProp } from '../utils/props';
import { getHeritage } from '../utils/walk';
import type { ComponentNode } from './analyze-plugin';

export function discoverComponents(checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const discovered: ComponentNode[] = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    if (!ts.isClassDeclaration(node) || !node.name || !node.heritageClauses) return;

    const heritage = getHeritage(checker, node),
      baseComponent = heritage.classes.get('Component');

    if (!baseComponent || !baseComponent.getSourceFile().fileName.includes('maverick')) return;

    const types = {
      root: checker.getTypeAtLocation(node)!,
    } as ComponentNode['types'];

    const instanceSymbol = checker.getPropertyOfType(types.root, '$$')!,
      instanceType = instanceSymbol && (checker.getTypeOfSymbol(instanceSymbol) as any);

    if (instanceType && (instanceType.resolvedTypeArguments as ts.Type[])) {
      let i = 0;
      for (const arg of ['props', 'state', 'events', 'cssvars']) {
        types[arg] = instanceType.resolvedTypeArguments[i];
        i++;
      }
    }

    let props: ts.PropertyDeclaration | undefined;
    for (const [name, node] of heritage.classes) {
      if (name === 'Component') break;
      props = getStaticProp(node, 'props');
      if (props) break;
    }

    let state: ts.PropertyDeclaration | undefined;
    for (const [name, node] of heritage.classes) {
      if (name === 'Component') break;
      state = getStaticProp(node, 'state');
      if (state) break;
    }

    discovered.push({
      name: node.name.escapedText as string,
      root: node,
      props,
      state,
      types,
    });
  });

  return discovered;
}
