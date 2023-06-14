import type ts from 'typescript';

import type { ComponentMeta } from '../meta/component';
import type { ElementMeta } from '../meta/element';

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

export interface ElementNode {
  name: string;
  root: ts.ClassDeclaration;
  tag: {
    node: ts.PropertyDeclaration;
    name: string;
  };
  component: {
    node: ts.ClassDeclaration;
    name: string;
  };
  attrs?: ts.PropertyDeclaration;
}

export interface AnalyzePlugin {
  name: string;

  init?(program: ts.Program): Promise<void>;

  discoverComponents?(sourceFile: ts.SourceFile): Promise<ComponentNode[] | null | undefined>;
  buildComponent?(definition: ComponentNode): Promise<ComponentMeta | null | undefined | void>;

  discoverElements?(sourceFile: ts.SourceFile): Promise<ElementNode[] | null | undefined>;
  buildElement?(definition: ElementNode): Promise<ElementMeta | null | undefined | void>;

  transform?(
    meta: TransformMeta,
    sourceFiles: Map<ElementMeta | ComponentMeta, ts.SourceFile>,
  ): Promise<void>;

  destroy?(): Promise<void>;
}

export interface TransformMeta {
  components: ComponentMeta[];
  elements: ElementMeta[];
}

export type AnalyzePluginBuilder<ConfigType = any> = (config?: ConfigType) => AnalyzePlugin;
