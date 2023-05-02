import { encode } from 'html-entities';

import { escape } from '../../utils/html';
import {
  createFunctionCall,
  createStringLiteral,
  Declarations,
  selfInvokingFunction,
  trimQuotes,
  trimTrailingSemicolon,
} from '../../utils/print';
import {
  type AttributeNode,
  type ComponentChildren,
  type ElementNode,
  isAST,
  isAttributeNode,
  isAttributesEnd,
  isChildrenEnd,
  isChildrenStart,
  isDirectiveNode,
  isElementEnd,
  isElementNode,
  isEventNode,
  isExpressionNode,
  isFragmentNode,
  isRefNode,
  isSpreadNode,
  isStructuralNode,
  isTextNode,
} from '../ast';
import {
  serializeChildren,
  serializeComponentProp,
  serializeCreateComponent,
  serializeParentExpression,
} from '../jsx/utils';
import type { ASTSerializer } from '../transform';

const ID = {
  template: '$$_templ',
  root: '$$_root',
  walker: '$$_walker',
  element: '$$_el',
  component: '$$_comp',
  expression: '$$_expr',
};

const RUNTIME = {
  createTemplate: '$$_create_template',
  createFragment: '$$_create_fragment',
  createComponent: '$$_create_component',
  createWalker: '$$_create_walker',
  nextTemplate: '$$_next_template',
  nextElement: '$$_next_element',
  createElement: '$$_create_element',
  setupCustomElement: '$$_setup_custom_element',
  children: '$$_children',
  insert: '$$_insert',
  insertLite: '$$_insert_lite',
  insertAtMarker: '$$_insert_at_marker',
  insertAtMarkerLite: '$$_insert_at_marker_lite',
  listen: '$$_listen',
  delegateEvents: '$$_delegate_events',
  clone: '$$_clone',
  directive: '$$_directive',
  ref: '$$_ref',
  attr: '$$_attr',
  class: '$$_class',
  style: '$$_style',
  spread: '$$_spread',
  mergeProps: '$$_merge_props',
  computed: '$$_computed',
  effect: '$$_effect',
  peek: '$$_peek',
  hydrating: '$$_hydrating',
};

const MARKER = {
  component: '<!$>',
  element: '<!$>',
  expression: '<!$>',
};

const NEXT_ELEMENT = createFunctionCall(RUNTIME.nextElement, [ID.walker]);
const NEXT_MARKER = `${ID.walker}.nextNode()`;

export const dom: ASTSerializer = {
  name: 'dom',
  serialize(ast, ctx) {
    const firstNode = ast.tree[0],
      isFirstNodeElement = isElementNode(firstNode),
      isFirstNodeExpression = isExpressionNode(firstNode),
      isFirstNodeComponent = isFirstNodeElement && firstNode.isComponent;

    if (
      isFirstNodeExpression &&
      !firstNode.dynamic &&
      !firstNode.children?.length &&
      !firstNode.observable
    ) {
      return firstNode.value;
    }

    let skip = -1,
      initRoot = false,
      innerHTML = false,
      textContent = false,
      childrenFragment = false,
      currentId!: string,
      component!: ElementNode | undefined,
      customElement!: ElementNode | undefined,
      templateId: string | undefined,
      hierarchy: number[] = [],
      props: string[] = [],
      styles: string[] = [],
      spreads: string[] = [],
      expressions: string[] = [],
      groupedEffects: string[] = [],
      template: string[] = [],
      elements: ElementNode[] = [],
      locals = new Declarations(),
      elementChildIndex = -1,
      elementIds: Record<string, string> = {},
      createRootId = () => {
        if (!initRoot) {
          if (!templateId) templateId = ctx.globals.create(ID.template);

          if (ctx.hydratable) {
            locals.create(
              `[${ID.root}, ${ID.walker}]`,
              createFunctionCall(RUNTIME.createWalker, [templateId]),
            );
            ctx.runtime.add(RUNTIME.createWalker);
          } else {
            locals.create(ID.root, createFunctionCall(RUNTIME.clone, [templateId]));
          }

          currentId = ID.root;
          ctx.runtime.add(RUNTIME.clone);
          elementIds[0] = ID.root;
          initRoot = true;
        }

        return ID.root;
      },
      nextElement = () => {
        createRootId();
        ctx.runtime.add(RUNTIME.nextElement);
        return NEXT_ELEMENT;
      },
      nextMarker = () => {
        createRootId();
        return NEXT_MARKER;
      },
      getParentElementId = () => {
        createRootId();
        return getElementId(hierarchy, elementIds, locals);
      },
      getCurrentElementId = () => {
        createRootId();
        return getElementId(
          elementChildIndex >= 0 ? [...hierarchy, elementChildIndex] : hierarchy,
          elementIds,
          locals,
        );
      },
      getNextElementId = () => {
        createRootId();
        const element = elements.at(-1);
        const nextSibling = elementChildIndex + 1;
        return element && element.childCount > 1
          ? nextSibling >= element.childElementCount
            ? 'null'
            : getElementId([...hierarchy, nextSibling], elementIds, locals)
          : null;
      },
      addAttrExpression = (node: AttributeNode, runtimeId: string, name: string = node.name) => {
        if (node.observable) {
          const expression = createFunctionCall(runtimeId, [
            currentId,
            createStringLiteral(name),
            node.value,
          ]);
          if (ctx.groupDOMEffects) {
            groupedEffects.push(expression);
          } else {
            expressions.push(createFunctionCall(RUNTIME.effect, [`() => ${expression}`]));
            ctx.runtime.add(RUNTIME.effect);
          }
        } else {
          expressions.push(
            createFunctionCall(runtimeId, [currentId, createStringLiteral(name), node.value]),
          );
        }

        ctx.runtime.add(runtimeId);
      },
      addChildren = (children: ComponentChildren[]) => {
        const scoped = children.length > 1 || !isAST(children[0]);
        const serialized = serializeChildren(dom, children, { ...ctx, scoped }, true);
        const shouldReturn = scoped || /^(\[|\(|\$\$|\")/.test(serialized);
        props.push(
          `$children: $$_children(() => { ${shouldReturn ? `return ${serialized}` : serialized} })`,
        );
        ctx.runtime.add(RUNTIME.children);
      },
      insert = (marker: (() => string) | null, block: string) => {
        const beforeId = ctx.hydratable ? null : getNextElementId();
        const parentId = ctx.hydratable ? marker?.() ?? null : getParentElementId();
        const insertId = ctx.hydratable
          ? !ctx.diffArrays
            ? RUNTIME.insertAtMarkerLite
            : RUNTIME.insertAtMarker
          : !ctx.diffArrays
          ? RUNTIME.insertLite
          : RUNTIME.insert;
        expressions.push(createFunctionCall(insertId, [parentId, block, beforeId]));
        ctx.runtime.add(insertId);
      };

    if (isFirstNodeElement && !firstNode.isComponent) {
      hierarchy.push(0);
      if (ctx.hydratable) {
        template.push(MARKER.element);
      }
    }

    for (let i = 0; i < ast.tree.length; i++) {
      if (i <= skip) continue;

      const node = ast.tree[i];

      if (component) {
        if (isAttributeNode(node) && !node.namespace) {
          props.push(serializeComponentProp(dom, node, ctx));
        } else if (isSpreadNode(node)) {
          props.push('$$SPREAD');
          spreads.unshift(node.value);
        } else if (isStructuralNode(node) && isElementEnd(node)) {
          if (component.children) addChildren(component.children);

          const { createComponent, shouldMergeProps } = serializeCreateComponent(
            RUNTIME.createComponent,
            RUNTIME.mergeProps,
            component.tagName,
            props,
            spreads,
          );

          if (isFirstNodeComponent) {
            expressions.push(createComponent);
          } else {
            insert(() => currentId, createComponent);
          }

          ctx.runtime.add(RUNTIME.createComponent);
          if (shouldMergeProps) ctx.runtime.add(RUNTIME.mergeProps);

          props = [];
          spreads = [];
          component = undefined;
        }
      } else if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          const element = elements.at(-1);

          if (element && element.tagName.includes('-')) {
            if (!innerHTML && element.children) {
              addChildren(element.children);
            }

            expressions.push(
              createFunctionCall(RUNTIME.setupCustomElement, [
                currentId,
                props.length > 0 ? `{ ${props.join(', ')} }` : null,
              ]),
            );

            props = [];
            template.push(` mk-d`);
            ctx.runtime.add(RUNTIME.setupCustomElement);
          }

          if (styles.length > 0) {
            template.push(` style="${styles.join(';')}"`);
            styles = [];
          }

          if (element && !element.isVoid) template.push('>');
        } else if (isChildrenStart(node)) {
          if (innerHTML) {
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

            const element = elements.pop();
            if (element) {
              template.push(element.isVoid ? ` />` : `</${element.tagName}>`);
            }

            elementChildIndex = hierarchy.pop()!;
          } else if (elements.at(-1) !== firstNode) {
            hierarchy.push(elementChildIndex);
            elementChildIndex = -1;
          }
        } else if (isChildrenEnd(node)) {
          elementChildIndex = hierarchy.pop()!;
        } else if (isElementEnd(node)) {
          const element = elements.pop();

          if (element) {
            if (textContent) {
              template.push(' ');
              textContent = false;
            }

            template.push(element.isVoid ? ` />` : `</${element.tagName}>`);
          }

          innerHTML = false;
        }
      } else if (isFragmentNode(node)) {
        if (node.children) {
          expressions.push(
            serializeChildren(dom, node.children, {
              ...ctx,
              scoped: true,
              fragment: true,
            }),
          );

          childrenFragment = true;
        } else {
          expressions.push('""');
        }
      } else if (isElementNode(node)) {
        if (isFirstNodeComponent && node == firstNode) {
          component = node;
          continue;
        }

        if (node.isComponent) component = node;

        const isCustomElement = node.tagName.includes('-');
        if (isCustomElement) customElement = node;

        const isElement = !component;
        if (i > 0 && isElement) elementChildIndex++;

        const dynamic = node.dynamic();

        if (dynamic) {
          if (ctx.hydratable) {
            if (node.isComponent) {
              currentId = locals.create(ID.component, nextMarker());
            } else if (i > 0) {
              currentId = locals.create(ID.element, nextElement());
            } else {
              currentId = createRootId();
            }
          } else {
            currentId = getCurrentElementId();
          }
        }

        if (ctx.hydratable && i > 0 && dynamic) {
          template.push(MARKER.element);
        }

        if (isElement) {
          template.push(`<${node.tagName}`);
          elements.push(node);
        }
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$prop') {
            if (node.name === 'innerHTML') {
              innerHTML = true;

              if (customElement) {
                props.push(`innerHTML: true`);
              }

              if (node.observable) {
                expressions.push(
                  createFunctionCall(RUNTIME.effect, [
                    ctx.hydratable
                      ? `() => { if (!${RUNTIME.hydrating}) (${currentId}.innerHTML = ${node.value}) }`
                      : `() => void (${currentId}.innerHTML = ${node.value})`,
                  ]),
                );

                ctx.runtime.add(RUNTIME.effect);
              } else {
                expressions.push(
                  ctx.hydratable
                    ? `if (!${RUNTIME.hydrating}) ${currentId}.innerHTML = ${node.value}`
                    : `${currentId}.innerHTML = ${node.value}`,
                );
              }

              if (ctx.hydratable) ctx.runtime.add(RUNTIME.hydrating);
            } else if (customElement) {
              if (!node.children && node.observable) {
                props.push(`${node.name}: ${node.callId ?? `() => ${node.value}`}`);
              } else {
                props.push(serializeComponentProp(dom, node, ctx));
              }
            } else if (node.observable) {
              if (ctx.groupDOMEffects) {
                if (node.name === 'textContent') {
                  textContent = true;
                  groupedEffects.push(
                    `${getElementId([...hierarchy, 0, 0], elementIds, locals)}.data = ${
                      node.value
                    }`,
                  );
                } else {
                  groupedEffects.push(`${currentId}.${node.name} = ${node.value}`);
                }
              } else {
                expressions.push(
                  createFunctionCall(RUNTIME.effect, [
                    `() => void (${currentId}.${node.name} = ${node.value})`,
                  ]),
                );
                ctx.runtime.add(RUNTIME.effect);
              }
            } else {
              expressions.push(`${currentId}.${node.name} = ${node.value};`);
            }
          } else if (node.namespace === '$class') {
            addAttrExpression(node, RUNTIME.class);
          } else if (node.namespace === '$style') {
            if (!node.dynamic) {
              styles.push(`${node.name}: ${trimQuotes(node.value)}`);
            } else {
              addAttrExpression(node, RUNTIME.style);
            }
          } else if (node.namespace === '$cssvar') {
            if (!node.dynamic) {
              styles.push(`--${node.name}: ${trimQuotes(node.value)}`);
            } else {
              addAttrExpression(node, RUNTIME.style, `--${node.name}`);
            }
          }
        } else if (!node.dynamic) {
          if (node.name === 'style') {
            styles.push(trimTrailingSemicolon(trimQuotes(node.value)));
          } else {
            template.push(` ${node.name}="${escape(trimQuotes(node.value), true)}"`);
          }
        } else {
          addAttrExpression(node, RUNTIME.attr);
        }
      } else if (isRefNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.ref, [currentId, node.value]));
        ctx.runtime.add(RUNTIME.ref);
      } else if (isEventNode(node)) {
        if (node.delegate && ctx.delegateEvents) {
          ctx.events.add(createStringLiteral(node.type));
          expressions.push(`${currentId}.$$${node.type} = ${node.value};`);
          if (node.data) {
            expressions.push(`${currentId}.$$${node.type}Data = ${node.data};`);
          }
        } else {
          const args = [currentId, createStringLiteral(node.type), node.value];
          if (node.namespace === '$oncapture') args.push(`1 /* CAPTURE */`);
          expressions.push(createFunctionCall(RUNTIME.listen, args));
          ctx.runtime.add(RUNTIME.listen);
        }
      } else if (isDirectiveNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.directive, [currentId, node.name, node.value]));
        ctx.runtime.add(RUNTIME.directive);
      } else if (isTextNode(node)) {
        if (!ctx.hydratable) elementChildIndex++;
        template.push(node.value);
      } else if (isExpressionNode(node)) {
        if (!node.dynamic) {
          template.push(encode(trimQuotes(node.value)));
        } else {
          const shouldInsert = !isFirstNodeExpression || node !== firstNode;
          if (!initRoot && shouldInsert) createRootId();
          if (ctx.hydratable && shouldInsert) template.push(MARKER.expression);
          const code = !node.children
            ? node.value
            : serializeParentExpression(dom, node, ctx, !shouldInsert && RUNTIME.peek);
          const expression = node.callId ?? (node.observable ? `() => ${code}` : code);
          if (shouldInsert) {
            insert(() => locals.create(ID.expression, nextMarker()), expression);
          } else if (ctx.fragment && ctx.hydratable) {
            if (!node.observable && !node.children?.length) {
              expressions.push(expression);
            } else if (node.children?.length) {
              expressions.push(
                selfInvokingFunction(
                  [
                    `const $$_signal = ${createFunctionCall(RUNTIME.computed, [`() => ${code}`])};`,
                    '$$_signal();',
                    'return $$_signal;',
                  ].join(''),
                ),
              );
              ctx.runtime.add(RUNTIME.computed);
            } else {
              expressions.push(
                node.callId ?? createFunctionCall(RUNTIME.computed, [`() => ${code}`]),
              );
              ctx.runtime.add(RUNTIME.computed);
            }
          } else {
            expressions.push(expression);
            ctx.runtime.add(RUNTIME.peek);
          }
        }
      } else if (isSpreadNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.spread, [currentId, node.value]));
        ctx.runtime.add(RUNTIME.spread);
      }
    }

    if (template.length) {
      const expression = createFunctionCall(RUNTIME.createTemplate, [`\`${template.join('')}\``]);

      if (templateId) {
        ctx.globals.update(templateId, expression);
      } else {
        templateId = ctx.globals.create(ID.template, expression);
      }

      ctx.runtime.add(RUNTIME.createTemplate);
    } else if (templateId) {
      ctx.globals.update(templateId, createFunctionCall(RUNTIME.createFragment));
      ctx.runtime.add(RUNTIME.createFragment);
    }

    if (groupedEffects.length) {
      expressions.push(
        createFunctionCall(RUNTIME.effect, [`() => { ${groupedEffects.join(';')} }`]),
      );
      ctx.runtime.add(RUNTIME.effect);
    }

    if (locals.size > 1 || expressions.length) {
      return isFirstNodeComponent || isFirstNodeExpression
        ? expressions.join(';')
        : childrenFragment && expressions.length === 1
        ? expressions[expressions.length - 1]
        : [
            ctx.scoped && `(() => { `,
            locals.serialize(),
            '\n',
            ...(childrenFragment ? expressions.slice(0, -1) : expressions).join(';'),
            ';',
            '\n',
            '\n',
            `return ${createRootId()}`,
            ctx.scoped && '})()',
          ]
            .filter(Boolean)
            .join('');
    } else if (templateId) {
      if (ctx.hydratable) {
        ctx.runtime.add(RUNTIME.nextTemplate);
        return createFunctionCall(RUNTIME.nextTemplate, [templateId]);
      }

      ctx.runtime.add(RUNTIME.clone);
      return createFunctionCall(RUNTIME.clone, [templateId]);
    }

    return 'null';
  },
};

function getElementId(
  positions: number[],
  cache: Record<string, string>,
  declarations: Declarations,
) {
  const key = positions.join('');
  if (cache[key]) return cache[key];

  let id = ID.root,
    hierarchy = '0';

  for (let i = 1; i < positions.length; i++) {
    const childIndex = positions[i];
    const current = hierarchy + childIndex;

    if (cache[current]) {
      id = cache[current];
    } else {
      for (let j = 0; j <= childIndex; j++) {
        const sibling = hierarchy + j;
        id = cache[sibling] ??= declarations.create(
          ID.element,
          `${id}.${j === 0 ? 'firstChild' : 'nextSibling'}`,
        );
      }
    }

    hierarchy = current;
  }

  return id;
}
