import type ts from 'typescript';

import type { ComponentMeta } from '../meta/component';
import type { CustomElementMeta } from '../meta/custom-element';
import type { ModuleExport, ReactComponentMeta } from '../meta/react';

export type AnalyzeFramework = 'default' | 'react';

export interface ComponentNode {
  name: string;
  root: ts.ClassDeclaration;
  props?: ts.PropertyDeclaration;
  state?: ts.PropertyDeclaration;
  types: {
    root: ts.Type;
    props?: ts.Type;
    state?: ts.Type;
    events?: ts.Type;
    cssvars?: ts.Type;
  };
}

export interface CustomElementNode {
  name: string;
  root: ts.ClassDeclaration;
  tag: {
    node: ts.PropertyDeclaration;
    name: string;
  };
  component?: {
    node: ts.ClassDeclaration;
    name: string;
  };
  attrs?: ts.PropertyDeclaration;
}

export interface ReactComponentNode {
  file: string;
  namespace?: string;
  exports?: ModuleExport[];
  name: string;
  statement?: ts.VariableStatement;
  root: ts.VariableDeclaration | ts.FunctionDeclaration;
  component: ts.FunctionDeclaration | ts.ArrowFunction;
  identifier: ts.Identifier;
  props?: ts.Declaration;
  displayName?: string;
  attributes?: string;
  instance?: string;
  types: {
    root: ts.Type;
    ref?: ts.Type;
    props?: ts.Type;
  };
}

export interface AnalyzePlugin {
  name: string;

  init?(program: ts.Program): Promise<void>;

  discoverComponents?(sourceFile: ts.SourceFile): Promise<ComponentNode[] | null | undefined>;
  buildComponentMeta?(definition: ComponentNode): Promise<ComponentMeta | null | undefined | void>;

  discoverCustomElements?(
    sourceFile: ts.SourceFile,
  ): Promise<CustomElementNode[] | null | undefined>;
  buildCustomElementMeta?(
    definition: CustomElementNode,
  ): Promise<CustomElementMeta | null | undefined | void>;

  discoverReactComponents?(
    sourceFile: ts.SourceFile,
  ): Promise<ReactComponentNode[] | null | undefined>;
  buildReactComponentMeta?(
    definition: ReactComponentNode,
  ): Promise<ReactComponentMeta | null | undefined | void>;

  transform?(data: TransformData, sourceFiles: TransformSourceFiles): Promise<void>;

  destroy?(): Promise<void>;
}

export interface TransformData {
  components: ComponentMeta[];
  customElements: CustomElementMeta[];
  reactComponents: ReactComponentMeta[];
}

export type TransformSourceFiles = Map<
  CustomElementMeta | ComponentMeta | ReactComponentMeta,
  ts.SourceFile
>;

export type AnalyzePluginBuilder<ConfigType = any> = (config?: ConfigType) => AnalyzePlugin;
