import { encode } from 'html-entities';

import { escape } from '../../utils/html';
import {
  createFunctionCall,
  createObjectLiteral,
  escapeDoubleQuotes,
  trimQuotes,
  trimTrailingSemicolon,
} from '../../utils/print';
import {
  type AttributeNode,
  type ElementNode,
  isAttributeNode,
  isAttributesEnd,
  isChildrenEnd,
  isChildrenStart,
  isElementEnd,
  isElementNode,
  isExpressionNode,
  isFragmentNode,
  isSpreadNode,
  isStructuralNode,
  isTextNode,
  type SpreadNode,
} from '../ast';
import {
  serializeChildren,
  serializeComponentChildrenProp,
  serializeComponentProp,
  serializeCreateComponent,
  serializeParentExpression,
} from '../jsx/utils';
import type { ASTSerializer } from '../transform';

const HYDRATION_MARKER = '<!$>';

const ID = {
  template: '$$_templ',
};

const RUNTIME = {
  createComponent: '$$_create_component',
  customElement: '$$_custom_element',
  ssr: '$$_ssr',
  attr: '$$_attr',
  classes: '$$_classes',
  styles: '$$_styles',
  spread: '$$_spread',
  mergeProps: '$$_merge_props',
  injectHTML: '$$_inject_html',
};

export const ssr: ASTSerializer = {
  name: 'ssr',
  serialize(ast, ctx) {
    let skip = -1,
      merging = false,
      childrenFragment = false,
      template = '',
      templates: string[] = [],
      parts: string[] = [],
      innerHTML: string | undefined,
      classes: AttributeNode[] = [],
      styles: AttributeNode[] = [],
      props: string[] = [],
      merger: (AttributeNode | SpreadNode)[] = [],
      spreads: string[] = [],
      elements: ElementNode[] = [],
      component!: ElementNode | undefined,
      customElements: {
        el: ElementNode;
        part: number;
        children: string[];
        props?: string[];
        spreads?: string[];
      }[] = [],
      commit = (part: string | null) => {
        if (part !== null) parts.push(part);
        templates.push(template);
        template = '';
      },
      marker = () => {
        template += HYDRATION_MARKER;
      },
      commitInnerHTML = (i: number, inject = true) => {
        if (!innerHTML) return;

        if (inject) {
          commit(createFunctionCall(RUNTIME.injectHTML, [innerHTML]));
          ctx.runtime.add(RUNTIME.injectHTML);
        }

        let depth = 0;
        for (let j = i + 1; j < ast.tree.length; j++) {
          const node = ast.tree[j];
          if (isStructuralNode(node)) {
            if (isChildrenStart(node)) {
              depth++;
            } else if (isChildrenEnd(node)) {
              if (depth === 0) {
                skip = j + 1;
                break;
              } else {
                depth--;
              }
            }
          }
        }

        innerHTML = undefined;
      },
      insertCustomElement = () => {
        const customEl = customElements.at(-1);
        if (!customEl) return;

        if (customEl.children.length) {
          (customEl.props ??= []).push(`$children: () => [${customEl.children.join(', ')}]`);
        }

        const setup =
          '...' +
          createFunctionCall(RUNTIME.customElement, [
            `'${customEl.el.tagName}'`,
            customEl.props?.length
              ? `{ ${customEl.props.join(', ')} }`
              : customEl.spreads?.length
              ? 'undefined'
              : null,
            customEl.spreads?.length ? `[${customEl.spreads.join(', ')}]` : null,
          ]);

        const parent = customElements.at(-2);
        if (parent) {
          parent.children.push(setup);
        } else {
          parts[customEl.part] = setup;
        }

        customElements.pop();
        ctx.runtime.add(RUNTIME.customElement);
      };

    const firstNode = ast.tree[0],
      isFirstNodeElement = isElementNode(firstNode),
      isFirstNodeComponent = isFirstNodeElement && firstNode.isComponent;

    if (isFirstNodeElement && !firstNode.isComponent) {
      template += HYDRATION_MARKER;
    }

    for (let i = 0; i < ast.tree.length; i++) {
      if (i <= skip) continue;

      const node = ast.tree[i];

      if (component) {
        if (isAttributeNode(node) && !node.namespace) {
          props.push(serializeComponentProp(ssr, node, ctx));
        } else if (isSpreadNode(node)) {
          props.push('$$SPREAD');
          spreads.unshift(node.value);
        } else if (isStructuralNode(node) && isElementEnd(node)) {
          const children = component.children;

          if (children) {
            props.push(serializeComponentChildrenProp(ssr, children, ctx));
          }

          const { createComponent, shouldMergeProps } = serializeCreateComponent(
            RUNTIME.createComponent,
            RUNTIME.mergeProps,
            component.tagName,
            props,
            spreads,
          );

          commit(createComponent);

          ctx.runtime.add(RUNTIME.createComponent);
          if (shouldMergeProps) ctx.runtime.add(RUNTIME.mergeProps);

          props = [];
          spreads = [];
          component = undefined;
        }
      } else if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          const element = elements.at(-1);

          if (merging) {
            let $spread: string[] = [],
              $attrs: Record<string, string> = {},
              $$class: Record<string, string> = {},
              $$style: Record<string, string> = {};

            const commitAttrs = () => {
              if (Object.keys($$class).length) {
                $attrs.$$class = createObjectLiteral($$class);
                $$class = {};
              }

              if (Object.keys($$style).length) {
                $attrs.$$style = createObjectLiteral($$style);
                $$style = {};
              }

              if (Object.keys($attrs).length) {
                $spread.push(createObjectLiteral($attrs));
                $attrs = {};
              }
            };

            for (let i = 0; i < merger.length; i++) {
              const prop = merger[i];
              if (isAttributeNode(prop)) {
                if (prop.namespace === '$prop') {
                  props.push(serializeComponentProp(ssr, prop, ctx));
                } else {
                  let group = prop.namespace
                    ? prop.namespace === '$class'
                      ? $$class
                      : prop.namespace === '$style' || prop.namespace === '$cssvar'
                      ? $$style
                      : $attrs
                    : $attrs;

                  group[`${prop.namespace === '$cssvar' ? '--' : ''}${prop.name}`] =
                    prop.callId ?? prop.value;
                }
              } else {
                commitAttrs();
                $spread.push(prop.value);
              }
            }

            commitAttrs();

            if (element?.tagName.includes('-')) {
              const customEl = customElements.at(-1)!;
              if (props.length) customEl.props = props;
              if ($spread.length) customEl.spreads = $spread;
              props = [];
              spreads = [];
            } else if ($spread.length) {
              commit(createFunctionCall(RUNTIME.spread, [`[${$spread.join(', ')}]`]));
              ctx.runtime.add(RUNTIME.spread);
            }

            merger = [];
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

          merging = false;
          if (element && !element.isVoid && !element.tagName.includes('-')) {
            template += '>';
          }
        } else if (isChildrenStart(node)) {
          if (innerHTML) {
            const hasCustomElement = customElements.length > 0;
            insertCustomElement();
            commitInnerHTML(i, !hasCustomElement);
            const element = elements.pop();
            if (element) template += element.isVoid ? ` />` : `</${element.tagName}>`;
          }
        } else if (isElementEnd(node)) {
          const element = elements.pop();

          if (element?.childCount === 0) commitInnerHTML(i);

          if (element) {
            const customEl = customElements.at(-1);
            if (element === customEl?.el) insertCustomElement();
            template += element.isVoid ? ` />` : `</${element.tagName}>`;
          }
        }
      } else if (isFragmentNode(node)) {
        if (node.children) {
          commit(
            serializeChildren(ssr, node.children, {
              ...ctx,
              fragment: true,
            }),
          );

          childrenFragment = true;
        }
      } else if (isElementNode(node)) {
        if (node.isComponent) {
          if (i > 0) marker();
          component = node;
        } else {
          const isCustomElement = node.tagName.includes('-');

          if (i > 0 && node.dynamic()) marker();

          template += `<${node.tagName}`;
          elements.push(node);
          merging = isCustomElement || node.spread();

          if (isCustomElement) {
            customElements.push({
              el: node,
              part: parts.length,
              children: [],
            });
            commit(null); // attrs
            commit(null); // shadow-root
          }
        }
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$prop' && node.name === 'innerHTML') {
            if (merging) {
              merger.push(node);
            }

            if (!elements[elements.length - 1].isVoid) {
              innerHTML = node.value;
            }
          } else if (node.namespace === '$class') {
            if (merging) {
              merger.push(node);
            } else {
              classes.push(node);
            }
          } else if (node.namespace === '$style' || node.namespace === '$cssvar') {
            if (merging) {
              merger.push(node);
            } else {
              styles.push(node);
            }
          } else if (merging && node.namespace === '$prop') {
            merger.push(node);
          }
        } else {
          if (node.name === 'class') {
            if (merging) {
              merger.push(node);
            } else {
              classes.push(node);
            }
          } else if (node.name === 'style') {
            if (merging) {
              merger.push(node);
            } else {
              styles.push(node);
            }
          } else if (merging) {
            merger.push(node);
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
          if (!ctx.fragment && (elements.length > 0 || (node !== firstNode && node.observable))) {
            marker();
          }

          const code = !node.children ? node.value : serializeParentExpression(ssr, node, ctx);

          if (customElements.length) {
            commit(null);
            customElements.at(-1)!.children.push(code);
          } else {
            commit(node.callId ?? code);
          }
        }
      } else if (isSpreadNode(node)) {
        merger.push(node);
      }
    }

    if (template.length) {
      templates.push(template);
    }

    if (isFirstNodeComponent || (childrenFragment && parts.length === 1)) {
      return parts[0];
    } else if (templates.length) {
      const templateId = ctx.globals.create(
        ID.template,
        `[${templates.map((t) => `"${escapeDoubleQuotes(t)}"`).join(', ')}]`,
      );

      ctx.runtime.add(RUNTIME.ssr);
      return createFunctionCall(RUNTIME.ssr, [templateId, ...parts]);
    }

    return 'null';
  },
};

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
