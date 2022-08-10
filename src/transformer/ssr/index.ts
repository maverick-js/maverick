import { decode, encode } from 'html-entities';
import MagicString from 'magic-string';
import { escape } from '../../utils/html';
import {
  createFunctionCall,
  createObjectLiteral,
  createStringLiteral,
  escapeDoubleQuotes,
  trimQuotes,
  trimTrailingSemicolon,
} from '../../utils/print';
import {
  type ElementNode,
  type ExpressionNode,
  type AttributeNode,
  type SpreadNode,
  isElementNode,
  isAttributeNode,
  isSpreadNode,
  isTextNode,
  isExpressionNode,
  isStructuralNode,
  isElementEnd,
  isAttributesEnd,
  isAST,
} from '../ast';
import type { ASTSerializer, TransformContext } from '../transform';

const HYDRATION_MARKER = '<!$>';

const ID = {
  template: '$$_templ',
};

const RUNTIME = {
  createComponent: '$$_create_component',
  ssr: '$$_ssr',
  attr: '$$_attr',
  classes: '$$_classes',
  styles: '$$_styles',
  spread: '$$_spread',
  mergeProps: '$$_merge_props',
};

export const ssr: ASTSerializer = {
  serialize(ast, ctx) {
    let template = '',
      spread = false,
      templates: string[] = [],
      parts: string[] = [],
      classes: AttributeNode[] = [],
      styles: AttributeNode[] = [],
      props: string[] = [],
      merge: (AttributeNode | SpreadNode)[] = [],
      spreads: string[] = [],
      elements: ElementNode[] = [],
      component!: ElementNode | undefined,
      commit = (part: string) => {
        parts.push(part);
        templates.push(template);
        template = '';
      },
      marker = () => {
        template += HYDRATION_MARKER;
      };

    const firstNode = ast.tree[0],
      isFirstNodeElement = isElementNode(firstNode),
      isFirstNodeComponent = isFirstNodeElement && firstNode.isComponent;

    for (let i = 0; i < ast.tree.length; i++) {
      const node = ast.tree[i];

      if (component) {
        if (isAttributeNode(node) && !node.namespace) {
          if (!node.observable || node.callId) {
            props.push(`${node.name}: ${node.callId ?? node.value}`);
          } else {
            props.push(`get ${node.name}() { return ${node.value}; }`);
          }
        } else if (isSpreadNode(node)) {
          spreads.push(node.value);
        } else if (isStructuralNode(node) && isElementEnd(node)) {
          const children = component.children;

          if (children) {
            const serialized = children.map((child) => {
              if (isAST(child)) {
                return ssr.serialize(child, ctx);
              } else if (isTextNode(child)) {
                return createStringLiteral(escapeDoubleQuotes(decode(child.value)));
              } else {
                return child.children ? transformParentExpression(child, ctx) : child.value;
              }
            });

            props.push(
              `get children() { return ${
                serialized.length === 1 ? serialized[0] : `[${serialized.join(', ')}]`
              } }`,
            );
          }

          const hasProps = props.length > 0;
          const hasSpreads = spreads.length > 0;
          const propsExpr = hasProps ? `{ ${props.join(', ')} }` : '';

          commit(
            createFunctionCall(RUNTIME.createComponent, [
              component.tagName,
              hasSpreads
                ? !hasProps && spreads.length === 1
                  ? spreads[0]
                  : createFunctionCall(RUNTIME.mergeProps, [...spreads, propsExpr])
                : propsExpr,
            ]),
          );

          props = [];
          spreads = [];
          component = undefined;
          ctx.runtime.add(RUNTIME.createComponent);
          if (hasSpreads) ctx.runtime.add(RUNTIME.mergeProps);
        }
      } else if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          const element = elements.at(-1);

          if (spread) {
            let props: string[] = [],
              classes: Record<string, string> = {},
              styles: Record<string, string> = {},
              currentAttrs: Record<string, string> = {};

            for (let i = 0; i < merge.length; i++) {
              const prop = merge[i];
              if (isAttributeNode(prop)) {
                let group = prop.namespace
                  ? prop.namespace === '$class'
                    ? classes
                    : prop.namespace === '$style' || prop.namespace === '$cssvar'
                    ? styles
                    : currentAttrs
                  : currentAttrs;

                group[`${prop.namespace === '$cssvar' ? '--' : ''}${prop.name}`] =
                  prop.callId ?? prop.value;
              } else {
                if (Object.keys(classes).length) {
                  currentAttrs.$$classes = createObjectLiteral(classes);
                  classes = {};
                }

                if (Object.keys(styles).length) {
                  currentAttrs.$$styles = createObjectLiteral(styles);
                  styles = {};
                }

                if (Object.keys(currentAttrs).length) {
                  props.push(createObjectLiteral(currentAttrs));
                  currentAttrs = {};
                }

                props.push(prop.value);
              }
            }

            if (props.length) {
              commit(createFunctionCall(RUNTIME.spread, [`[${props.join(', ')}]`]));
              ctx.runtime.add(RUNTIME.spread);
            }

            merge = [];
          } else {
            if (classes.length) {
              const baseClassIdx = classes.findIndex((c) => c.name === 'class'),
                baseClass = classes[baseClassIdx];

              if (
                baseClass &&
                classes.length === 1 &&
                !baseClass.dynamic &&
                baseClass.name === 'class'
              ) {
                template += ` class="${escape(trimQuotes(baseClass.value), true)}"`;
              } else {
                if (baseClass) classes.splice(baseClassIdx, 1);

                commit(
                  createFunctionCall(RUNTIME.classes, [
                    baseClass ? baseClass.callId ?? baseClass.value : '""',
                    classes.length > 0 ? createClassesObjectLiteral(classes) : null,
                  ]),
                );
                ctx.runtime.add(RUNTIME.classes);
              }

              classes = [];
            }

            if (styles.length) {
              const baseStyleIdx = styles.findIndex((style) => style.name === 'style'),
                baseStyle = styles[baseStyleIdx];

              if (
                baseStyle &&
                styles.length === 1 &&
                !baseStyle.dynamic &&
                baseStyle.name === 'style'
              ) {
                template += ` style="${escape(
                  trimTrailingSemicolon(trimQuotes(baseStyle.value)),
                  true,
                )}"`;
              } else {
                if (baseStyle) styles.splice(baseStyleIdx, 1);

                commit(
                  createFunctionCall(RUNTIME.styles, [
                    baseStyle ? baseStyle.callId ?? baseStyle.value : '""',
                    styles.length > 0 ? createStylesObjectLiteral(styles) : null,
                  ]),
                );

                ctx.runtime.add(RUNTIME.styles);
              }

              styles = [];
            }
          }

          spread = false;
          if (element && !element.isVoid) template += '>';
        } else if (isElementEnd(node)) {
          const element = elements.pop();
          if (element) template += element.isVoid ? ` />` : `</${element.tagName}>`;
        }
      } else if (isElementNode(node)) {
        if (node.isComponent) {
          marker();
          component = node;
        } else {
          if (node.dynamic()) marker();
          spread = node.spread();
          elements.push(node);
          template += `<${node.tagName}`;
        }
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$class') {
            if (spread) {
              merge.push(node);
            } else {
              classes.push(node);
            }
          } else if (node.namespace === '$style' || node.namespace === '$cssvar') {
            if (spread) {
              merge.push(node);
            } else {
              styles.push(node);
            }
          }
        } else {
          if (node.name === 'class') {
            if (spread) {
              merge.push(node);
            } else {
              classes.push(node);
            }
          } else if (node.name === 'style') {
            if (spread) {
              merge.push(node);
            } else {
              styles.push(node);
            }
          } else if (spread) {
            merge.push(node);
          } else if (!node.dynamic) {
            template += ` ${node.name}="${escape(trimQuotes(node.value), true)}"`;
          } else {
            commit(createFunctionCall(RUNTIME.attr, [`"${node.name}"`, node.callId ?? node.value]));
            ctx.runtime.add(RUNTIME.attr);
          }
        }
      } else if (isTextNode(node)) {
        template += node.value;
      } else if (isExpressionNode(node)) {
        if (!node.dynamic) {
          template += encode(trimQuotes(node.value));
        } else {
          marker();
          const code = !node.children ? node.value : transformParentExpression(node, ctx);
          commit(node.callId ?? (node.observable ? `() => ${code}` : code));
        }
      } else if (isSpreadNode(node)) {
        merge.push(node);
      }
    }

    if (template.length) {
      templates.push(template);
    }

    if (isFirstNodeComponent) {
      return parts[0];
    } else if (templates.length) {
      const templateId = ctx.globals.create(
        ID.template,
        `[${templates.map((t) => `"${escapeDoubleQuotes(t)}"`).join(', ')}]`,
      );

      ctx.runtime.add(RUNTIME.ssr);
      return createFunctionCall(RUNTIME.ssr, [templateId, ...parts]);
    }

    return '';
  },
};

function transformParentExpression(node: ExpressionNode, ctx: TransformContext) {
  let code = new MagicString(node.value),
    start = node.ref.getStart() + 1;

  for (const ast of node.children!) {
    code.overwrite(ast.root.getStart() - start, ast.root.getEnd() - start, ssr.serialize(ast, ctx));
  }

  return code.toString();
}

function createClassesObjectLiteral(classes: AttributeNode[]) {
  const props = {};

  for (let i = 0; i < classes.length; i++) {
    const attr = classes[i];
    props[attr.name] = attr.callId ?? attr.value;
  }

  return createObjectLiteral(props);
}

function createStylesObjectLiteral(classes: AttributeNode[]) {
  const props = {};

  for (let i = 0; i < classes.length; i++) {
    const attr = classes[i];
    props[`${attr.namespace === '$cssvar' ? '--' : ''}${attr.name}`] = attr.callId ?? attr.value;
  }

  return createObjectLiteral(props);
}
