import { decode, encode } from 'html-entities';
import MagicString from 'magic-string';
import { escapeHTML } from '../../utils/html';
import {
  createFunctionCall,
  createStringLiteral,
  escapeDoubleQuotes,
  trimQuotes,
  trimTrailingSemicolon,
} from '../../utils/print';
import {
  type ElementNode,
  type ExpressionNode,
  type AttributeNode,
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
      templates: string[] = [],
      parts: string[] = [],
      classes: AttributeNode[] = [],
      styles: AttributeNode[] = [],
      props: string[] = [],
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

          if (classes.length) {
            const firstClass = classes[0];

            if (classes.length === 1 && !firstClass.dynamic && firstClass.name === 'class') {
              template += ` class="${escapeHTML(trimQuotes(firstClass.value), true)}"`;
            } else {
              const hasBase = firstClass.name === 'class';
              commit(
                createFunctionCall(RUNTIME.classes, [
                  hasBase ? firstClass.callId ?? firstClass.value : '""',
                  ...(hasBase ? classes.slice(1) : classes).map(
                    (c) => `["${c.name}", ${c.callId ?? c.value}]`,
                  ),
                ]),
              );
              ctx.runtime.add(RUNTIME.classes);
            }

            classes = [];
          }

          if (styles.length) {
            const firstStyle = styles[0];
            if (styles.length === 1 && !firstStyle.dynamic && firstStyle.name === 'style') {
              template += ` style="${escapeHTML(
                trimTrailingSemicolon(trimQuotes(firstStyle.value)),
                true,
              )}"`;
            } else {
              const hasBase = firstStyle.name === 'style';
              commit(
                createFunctionCall(RUNTIME.styles, [
                  hasBase ? firstStyle.callId ?? firstStyle.value : '""',
                  ...(hasBase ? styles.slice(1) : styles).map(
                    (c) =>
                      `["${c.namespace === '$cssvar' ? '--' : ''}${c.name}", ${
                        c.callId ?? c.value
                      }]`,
                  ),
                ]),
              );
              ctx.runtime.add(RUNTIME.styles);
            }

            styles = [];
          }

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
          elements.push(node);
          template += `<${node.tagName}`;
        }
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$class') {
            classes.push(node);
          } else if (node.namespace === '$style' || node.namespace === '$cssvar') {
            styles.push(node);
          }
        } else {
          if (node.name === 'class') {
            classes.push(node);
          } else if (node.name === 'style') {
            styles.push(node);
          } else if (!node.dynamic) {
            template += ` ${node.name}="${escapeHTML(trimQuotes(node.value), true)}"`;
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
        commit(createFunctionCall(RUNTIME.spread, [node.value]));
        ctx.runtime.add(RUNTIME.spread);
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
