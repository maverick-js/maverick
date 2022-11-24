import type ts from 'typescript';

import type { ComponentMeta } from '../meta/component';

export type ElementDefintionNode = {
  name: string;
  tagName: ComponentMeta['tagname'];
  statement: ts.VariableStatement;
  variable: ts.VariableDeclaration;
  call: ts.CallExpression;
  declaration: ts.ObjectLiteralExpression;
};

export interface AnalyzePlugin {
  name: string;
  init?(program: ts.Program): Promise<void>;
  discover?(sourceFile: ts.SourceFile): Promise<ElementDefintionNode[] | null | undefined>;
  build?(definition: ElementDefintionNode): Promise<ComponentMeta | null | undefined | void>;
  transform?(
    components: ComponentMeta[],
    sourceFiles: Map<ComponentMeta, ts.SourceFile>,
  ): Promise<void>;
  destroy?(): Promise<void>;
}

export type AnalyzePluginBuilder<ConfigType = any> = (config?: ConfigType) => AnalyzePlugin;
