import { basename, dirname, extname, resolve } from 'pathe';
import ts from 'typescript';

import { kebabToPascalCase } from '../../utils/str';
import { getDeclaration } from '../utils/declaration';
import { serializeType } from '../utils/types';
import { getReturnExpression, walkTypeHeritage } from '../utils/walk';
import type { ReactComponentNode } from './analyze-plugin';

const componentNameRE = /^[A-Z]/;

export function discoverReactComponents(checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const discovered: ReactComponentNode[] = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    // Component.displayName = "..."
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      ts.isPropertyAccessExpression(node.expression.left) &&
      node.expression.left.name.escapedText === 'displayName' &&
      ts.isStringLiteral(node.expression.right)
    ) {
      const id = node.expression.left.expression;
      if (ts.isIdentifier(id)) {
        const name = id.escapedText,
          component = discovered.find((node) => node.name === name);
        if (component) {
          component.displayName = node.expression.right.text + '';
        }
      }
    }

    // Namespace: export { Root, Thumb, Track }
    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements.length > 1
    ) {
      const file = node.getSourceFile().fileName,
        root = kebabToPascalCase(basename(file, extname(file)));
      for (const specifier of node.exportClause.elements) {
        const name = specifier.name.escapedText,
          component = discovered.find((node) => node.name === name);
        if (component) {
          component.namespace = root;
        }
      }
    }

    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text.startsWith('.')
    ) {
      const filePath = node.getSourceFile().fileName,
        moduleFilePath = resolve(dirname(filePath), node.moduleSpecifier.text),
        component = discovered.find((c) => c.file === filePath);

      if (!component) return;
      component.exports ??= [];

      let currentExport = component.exports.find((f) => f.file === moduleFilePath);

      // export * from './*'
      if (!node.exportClause) {
        if (!currentExport) component.exports.push({ file: moduleFilePath });
      }
      // export { Foo, Bar as Baz }  from './*'
      else if (ts.isNamedExports(node.exportClause)) {
        if (!currentExport) {
          currentExport = { file: moduleFilePath, alias: {} };
          component.exports.push(currentExport);
        }

        for (const el of node.exportClause.elements) {
          const name = el.name.escapedText as string,
            propName = (el.propertyName?.escapedText as string) ?? name;
          currentExport.alias![propName] = name;
        }
      }
    }

    if (!ts.isFunctionDeclaration(node) && !ts.isVariableStatement(node)) {
      return;
    }

    const root = (
      ts.isVariableStatement(node) ? node.declarationList.declarations[0] : node
    ) as ReactComponentNode['root'];

    if (!root || !root.name || !ts.isIdentifier(root.name)) return;

    const name = root.name.escapedText as string;
    if (!componentNameRE.test(name)) return;

    let component: ts.FunctionDeclaration | ts.ArrowFunction | undefined,
      refType: ts.Type | undefined = undefined,
      propsType: ts.Type | undefined = undefined;

    if (ts.isVariableDeclaration(root)) {
      if (!root.initializer) {
        return;
      } else if (
        ts.isFunctionDeclaration(root.initializer) ||
        ts.isArrowFunction(root.initializer)
      ) {
        component = root.initializer;
      } else if (ts.isCallExpression(root.initializer)) {
        let args = root.initializer.arguments,
          expression = root.initializer.expression,
          typeArgs = root.initializer.typeArguments;

        // React.forwardRef()
        if (ts.isPropertyAccessExpression(expression)) expression = expression.name;
        if (!expression || !ts.isIdentifier(expression)) return;

        // Might be a HOF.
        if (expression.escapedText !== 'forwardRef') {
          let node: ts.Node | undefined = getDeclaration(checker, expression);

          // const foo = createComponent(...)
          if (node && ts.isVariableDeclaration(node)) node = node.initializer;

          if (node && (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node))) {
            const returns = getReturnExpression(node);
            if (!returns) return;
            if (returns && ts.isCallExpression(returns)) {
              let name = returns.expression;
              if (ts.isPropertyAccessExpression(name)) name = name.name;
              if (ts.isIdentifier(name) && name.escapedText === 'forwardRef') {
                args = returns.arguments;
                typeArgs = returns.typeArguments;
              }
            }
          }
        }

        // Extract props and ref type from forwardRef<REF_TYPE>(PROPS)
        if (args[0] && (ts.isFunctionDeclaration(args[0]) || ts.isArrowFunction(args[0]))) {
          component = args[0];
          if (typeArgs?.[0]) refType = checker.getTypeAtLocation(typeArgs[0]);
          if (typeArgs?.[1]) propsType = checker.getTypeAtLocation(typeArgs[1]);
        }
      }
    } else {
      component = root;
    }

    if (!component) return;

    let propsParam = component.parameters[0],
      instance: string | undefined,
      attributes: string | undefined;

    if (!propsType) {
      propsType = propsParam ? checker.getTypeAtLocation(propsParam) : undefined;
    }

    let props = propsType?.symbol?.declarations?.[0];
    if (props) {
      ({ instance, attributes } = findElementTypeArgs(checker, props));
    }

    // Try and infer the extended attributes (e.g., HTMLAttributes) from properties.
    if (!attributes && propsType) {
      const reactModule = /node_modules\/(@types\/)?react/;
      for (const prop of propsType.getProperties()) {
        const declaration = prop.declarations?.[0],
          file = declaration?.getSourceFile().fileName;
        if (
          declaration &&
          ts.isInterfaceDeclaration(declaration.parent) &&
          reactModule.test(file!)
        ) {
          const name = declaration.parent.name.escapedText as string;
          if (name.includes('Attributes')) {
            attributes = name;
            break;
          }
        }
      }
    }

    discovered.push({
      file: root.getSourceFile().fileName,
      name,
      root,
      statement: ts.isVariableStatement(node) ? node : undefined,
      component,
      identifier: root.name,
      instance,
      attributes,
      props,
      types: {
        root: checker.getTypeAtLocation(root)!,
        ref: refType,
        props: propsType,
      },
    });
  });

  return discovered;
}

function findElementTypeArgs(checker: ts.TypeChecker, props: ts.Declaration) {
  let instance: string | undefined, attributes: string | undefined;

  walkTypeHeritage(checker, props, {
    heritageClause(node) {
      let id = node.types[0]?.expression,
        typeArgs: ts.NodeArray<ts.Node> | undefined = node.types,
        unwrapped = false;

      // Unwrap expression Omit<Foo, 'bar'>
      const firstTypeArg = typeArgs[0];
      if (
        firstTypeArg &&
        ts.isExpressionWithTypeArguments(firstTypeArg) &&
        ts.isIdentifier(firstTypeArg.expression) &&
        /Omit|Pick/.test(firstTypeArg.expression.escapedText + '') &&
        firstTypeArg.typeArguments
      ) {
        const arg = firstTypeArg.typeArguments[0];
        if (arg && ts.isTypeReferenceNode(arg) && ts.isIdentifier(arg.typeName)) {
          id = arg.typeName;
          typeArgs = arg.typeArguments;
          unwrapped = true;
        }
      }

      // React.SVGAttributes => SVGAttributes
      if (ts.isPropertyAccessExpression(id)) {
        id = id.name;
      }

      if (ts.isIdentifier(id)) {
        if ((id.escapedText as string).includes('Attributes')) {
          const declaration = getDeclaration(checker, id),
            file = declaration?.getSourceFile().fileName;
          if (file && /node_modules\/(@types\/)?react/.test(file)) {
            const attrsName = typeArgs?.[0].getFullText().trim().replace('React.', '');
            if (attrsName) {
              attributes = attrsName;
              return true;
            }
          }
        } else if (id.escapedText === 'ReactElementProps') {
          if (!unwrapped && typeArgs?.[0]) {
            if (
              ts.isTypeReferenceNode(typeArgs[0]) ||
              ts.isExpressionWithTypeArguments(typeArgs[0])
            ) {
              typeArgs = typeArgs[0].typeArguments;
            }
          }

          const instanceTypeArg = typeArgs?.[0],
            elTypeArg = typeArgs?.[1];

          if (instanceTypeArg) {
            instance = serializeType(checker, checker.getTypeAtLocation(instanceTypeArg)).replace(
              /<(.*?)>/,
              '',
            );
          }

          if (elTypeArg && ts.isTypeReferenceNode(elTypeArg)) {
            const id = elTypeArg.typeName;
            if (ts.isIdentifier(id)) {
              attributes = `HTMLAttributes<${id.escapedText}>`;
            }
          } else {
            attributes = `HTMLAttributes`;
          }
          return true;
        }
      }
    },
  });

  return { instance, attributes };
}
