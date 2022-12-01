import type ts from 'typescript';

import type { ComponentMeta } from '../meta/component';
import type { SeenMemberSignatures } from '../utils/walk';

export interface ElementDefintionNode {
  name: string;
  tagName: ComponentMeta['tagname'];
  statement: ts.VariableStatement;
  variable: ts.VariableDeclaration;
  call: ts.CallExpression;
  declaration: ts.ObjectLiteralExpression;
  members: SeenMemberSignatures;
  types: {
    root: ts.TypeAliasDeclaration | ts.InterfaceDeclaration;
    props?:
      | ts.TypeLiteralNode
      | ts.TypeAliasDeclaration
      | ts.InterfaceDeclaration
      | ts.IntersectionTypeNode;
    events?:
      | ts.TypeLiteralNode
      | ts.TypeAliasDeclaration
      | ts.InterfaceDeclaration
      | ts.IntersectionTypeNode;
    cssvars?:
      | ts.TypeLiteralNode
      | ts.TypeAliasDeclaration
      | ts.InterfaceDeclaration
      | ts.IntersectionTypeNode;
  };
}

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
