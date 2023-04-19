import type ts from 'typescript';

import type { ComponentMeta, TagMeta } from '../meta/component';

export interface ElementDefintionNode {
  name: string;
  tag: TagMeta;
  root: {
    node: ts.ClassDeclaration;
    type: ts.Type;
  };
  el: {
    node: ts.PropertyDeclaration;
    definition: ts.ObjectLiteralExpression;
  };
  api: {
    root?: ts.Type;
    props?: ts.Type;
    events?: ts.Type;
    cssvars?: ts.Type;
    store?: ts.Type;
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
