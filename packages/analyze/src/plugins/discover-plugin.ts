import ts from 'typescript';

import type { AnalyzePlugin } from './analyze-plugin';
import { discoverComponents } from './discover-components';
import { discoverCustomElements } from './discover-custom-elements';
import { discoverReactComponents } from './discover-react-components';

export function createDiscoverPlugin(): AnalyzePlugin {
  let checker: ts.TypeChecker;
  return {
    name: 'maverick/discover',
    async init(program: ts.Program) {
      checker = program.getTypeChecker();
    },
    async discoverComponents(sourceFile) {
      return discoverComponents(checker, sourceFile);
    },
    async discoverCustomElements(sourceFile) {
      return discoverCustomElements(checker, sourceFile);
    },
    async discoverReactComponents(sourceFile) {
      return discoverReactComponents(checker, sourceFile);
    },
  };
}
