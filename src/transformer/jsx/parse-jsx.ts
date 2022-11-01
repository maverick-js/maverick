import t from 'typescript';
import { buildAST } from './parse';
import type { AST } from '../ast';
import { logTime } from '../../utils/logger';
import type MagicString from 'magic-string';

export type ParseJSXOptions = {
  filename: string;
};

const tsxRE = /\.tsx/;

const typeFunctions = new Set(['defineCSSVar', 'defineCSSVars', 'defineEvent', 'defineEvents']);

export function parseJSX(code: MagicString, options: Partial<ParseJSXOptions> = {}) {
  const { filename = '' } = options;

  const parseStartTime = process.hrtime();
  const sourceFile = t.createSourceFile(
    filename,
    code.original,
    99,
    true,
    tsxRE.test(filename) ? 4 : 2,
  );
  logTime('Parsed Source File (TS)', parseStartTime);

  const ast: AST[] = [];
  const imports = new Set<string>();

  let lastImportNode: t.Node | undefined;
  const parse = (node: t.Node) => {
    if (t.isImportDeclaration(node)) {
      lastImportNode = node;
      if (
        t.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text.startsWith('maverick.js') &&
        node.importClause?.namedBindings &&
        t.isNamedImports(node.importClause.namedBindings)
      ) {
        const elements = node.importClause.namedBindings.elements;
        for (const element of elements) imports.add(element.name.text);
      }
    } else if (isJSXElementNode(node) || t.isJsxFragment(node)) {
      ast.push(buildAST(node, {}));
      return;
    } else if (
      imports.size > 0 &&
      t.isCallExpression(node) &&
      t.isIdentifier(node.expression) &&
      imports.has(node.expression.text) &&
      typeFunctions.has(node.expression.text)
    ) {
      const isPropAssignment = t.isPropertyAssignment(node.parent);
      const shouldRemoveParent = isPropAssignment && !node.arguments[0];
      const replace = shouldRemoveParent ? node.parent : node;
      code.overwrite(
        replace.getStart(),
        replace.getEnd() +
          (shouldRemoveParent && code.original.charAt(node.parent.getEnd()) === ',' ? 1 : 0),
        node.arguments[0]?.getText() ?? (shouldRemoveParent ? '' : 'undefined'),
      );
    }

    t.forEachChild(node, parse);
  };

  t.forEachChild(sourceFile, parse);

  return {
    startPos: lastImportNode?.getEnd() ?? 0,
    imports,
    ast,
  };
}

export function isJSXElementNode(node: t.Node): node is JSXElementNode {
  return t.isJsxElement(node) || t.isJsxSelfClosingElement(node);
}

export type JSXElementNode = t.JsxElement | t.JsxSelfClosingElement;
export type JSXRootNode = JSXElementNode | t.JsxFragment;

export type JSXNodeMeta = {
  parent?: JSXNodeMeta;
  component?: boolean;
  dynamic?: () => void;
  spread?: () => void;
};

export type JSXAttrNamespace = '$class' | '$cssvar' | '$prop' | '$style';
export type JSXEventNamespace = '$on' | '$oncapture';
export type JSXDirectiveNamespace = '$use';
export type JSXNamespace = JSXAttrNamespace | JSXEventNamespace | JSXDirectiveNamespace;
export type JSXChildContentAttrName = '$innerHTML' | '$textContent' | '$innerText';
