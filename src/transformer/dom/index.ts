import {
  type AttributeNode,
  type ElementNode,
  type ComponentChildren,
  isAST,
  isAttributeNode,
  isAttributesEnd,
  isDirectiveNode,
  isElementEnd,
  isElementNode,
  isEventNode,
  isExpressionNode,
  isRefNode,
  isSpreadNode,
  isStructuralNode,
  isTextNode,
  isChildrenStart,
  isChildrenEnd,
  isFragmentNode,
} from '../ast';
import { type ASTSerializer } from '../transform';
import {
  createFunctionCall,
  createStringLiteral,
  Declarations,
  trimQuotes,
  trimTrailingSemicolon,
} from '../../utils/print';
import { escape } from '../../utils/html';
import { encode } from 'html-entities';
import kleur from 'kleur';
import { serializeChildren, serializeComponentProp, serializeParentExpression } from '../jsx/utils';

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
  setupCustomElement: '$$_setup_custom_element',
  insert: '$$_insert',
  insertAtMarker: '$$_insert_at_marker',
  listen: '$$_listen',
  listenDelegate: '$$_listen_delegate',
  clone: '$$_clone',
  directive: '$$_directive',
  ref: '$$_ref',
  attr: '$$_attr',
  class: '$$_class',
  prop: '$$_prop',
  style: '$$_style',
  cssvar: '$$_cssvar',
  spread: '$$_spread',
  mergeProps: '$$_merge_props',
  innerHTML: '$$_inner_html',
};

const MARKERS = {
  component: '<!$>',
  element: '<!$>',
  expression: '<!$>',
};

const NEXT_ELEMENT = createFunctionCall(RUNTIME.nextElement, [ID.walker]);
const NEXT_MARKER = `${ID.walker}.nextNode()`;

let scoped = true;
export const dom: ASTSerializer = {
  serialize(ast, ctx) {
    let initRoot = false,
      currentId!: string,
      component!: ElementNode | undefined,
      definition!: AttributeNode | undefined,
      customElement!: ElementNode | undefined,
      templateId: string | undefined,
      hierarchy: number[] = [],
      props: string[] = [],
      styles: string[] = [],
      spreads: string[] = [],
      expressions: string[] = [],
      template: string[] = [],
      elements: ElementNode[] = [],
      locals = new Declarations(),
      elementChildIndex = -1,
      elementIds: Record<string, string> = {},
      getRootId = () => {
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
          hierarchy.push(0);
          initRoot = true;
        }

        return ID.root;
      },
      nextElement = () => {
        if (!initRoot) getRootId();
        ctx.runtime.add(RUNTIME.nextElement);
        return NEXT_ELEMENT;
      },
      nextMarker = () => {
        if (!initRoot) getRootId();
        return NEXT_MARKER;
      },
      getParentElementId = () => {
        if (!initRoot) getRootId();
        return getElementId(hierarchy, elementIds, locals);
      },
      getCurrentElementId = () => {
        if (!initRoot) getRootId();
        return getElementId(
          elementChildIndex >= 0 ? [...hierarchy, elementChildIndex] : hierarchy,
          elementIds,
          locals,
        );
      },
      getNextElementId = () => {
        if (!initRoot) getRootId();
        const element = elements.at(-1);
        const nextSibling = elementChildIndex + 1;
        return element && element.childCount > 1
          ? nextSibling >= element.childElementCount
            ? 'null'
            : getElementId([...hierarchy, nextSibling], elementIds, locals)
          : null;
      },
      addAttrExpression = (node: AttributeNode, runtimeId: string) => {
        expressions.push(
          createFunctionCall(runtimeId, [
            currentId,
            createStringLiteral(node.name),
            node.callId ?? (node.observable ? `() => ${node.value}` : node.value),
          ]),
        );
        ctx.runtime.add(runtimeId);
      },
      addChildren = (children: ComponentChildren[]) => {
        const prevScoped = scoped;
        scoped = children.length !== 1 || !isAST(children[0]);
        const serialized = serializeChildren(dom, children, ctx);
        const hasReturn = scoped || /^(\[|\(|\$\$|\")/.test(serialized);
        props.push(`get children() { ${hasReturn ? `return ${serialized}` : serialized} }`);
        scoped = prevScoped;
      };

    const firstNode = ast.tree[0],
      isFirstNodeElement = isElementNode(firstNode),
      isFirstNodeComponent = isFirstNodeElement && firstNode.isComponent,
      isFirstNodeFragment = isFragmentNode(firstNode);

    if (ctx.hydratable && isFirstNodeElement && !firstNode.isComponent) {
      template.push(MARKERS.element);
    }

    for (let i = 0; i < ast.tree.length; i++) {
      const node = ast.tree[i];

      if (component) {
        if (isAttributeNode(node) && !node.namespace) {
          props.push(serializeComponentProp(node));
        } else if (isSpreadNode(node)) {
          spreads.push(node.value);
        } else if (isStructuralNode(node) && isElementEnd(node)) {
          if (component.children) addChildren(component.children);

          const hasProps = props.length > 0;
          const hasSpreads = spreads.length > 0;
          const propsExpr = hasProps ? `{ ${props.join(', ')} }` : '';

          const createComponent = createFunctionCall(RUNTIME.createComponent, [
            component.tagName,
            hasSpreads
              ? !hasProps && spreads.length === 1
                ? spreads[0]
                : createFunctionCall(RUNTIME.mergeProps, [...spreads, propsExpr])
              : propsExpr,
          ]);

          if (isFirstNodeComponent) {
            expressions.push(createComponent);
          } else {
            const insertId = ctx.hydratable ? RUNTIME.insertAtMarker : RUNTIME.insert;
            const beforeId = ctx.hydratable ? null : getNextElementId();

            expressions.push(
              createFunctionCall(insertId, [
                ctx.hydratable
                  ? currentId
                  : beforeId || elementChildIndex === -1
                  ? getParentElementId()
                  : (currentId ??= getCurrentElementId()),
                createComponent,
                beforeId,
              ]),
            );

            ctx.runtime.add(insertId);
          }

          ctx.runtime.add(RUNTIME.createComponent);

          if (hasSpreads && (hasProps || spreads.length > 1)) {
            ctx.runtime.add(RUNTIME.mergeProps);
          }

          props = [];
          spreads = [];
          component = undefined;
        }
      } else if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          if (customElement) {
            if (customElement.children) addChildren(customElement.children);

            expressions.push(
              createFunctionCall(RUNTIME.setupCustomElement, [
                currentId,
                definition!.value,
                props.length > 0 ? `{ ${props.join(', ')} }` : null,
              ]),
            );

            ctx.runtime.add(RUNTIME.setupCustomElement);
          }

          if (styles.length > 0) {
            template.push(` style="${styles.join(';')}"`);
            styles = [];
          }

          const element = elements.at(-1);
          if (element && !element.isVoid) template.push('>');
        } else if (isChildrenStart(node)) {
          if (elements.at(-1) !== firstNode) {
            hierarchy.push(elementChildIndex);
            elementChildIndex = -1;
          }
        } else if (isChildrenEnd(node)) {
          elementChildIndex = hierarchy.pop()!;
        } else if (isElementEnd(node)) {
          const element = elements.pop();

          if (definition) {
            template.push(`</\${${definition.value}.tagName}>`);
          } else if (element) {
            template.push(element.isVoid ? ` />` : `</${element.tagName}>`);
          }

          definition = undefined;
          customElement = undefined;
        }
      } else if (isFragmentNode(node)) {
        if (node.children) {
          const prevScoped = scoped;
          scoped = true;
          expressions.push(serializeChildren(dom, node.children, ctx));
          scoped = prevScoped;
        } else {
          expressions.push('""');
        }
      } else if (isElementNode(node)) {
        if (i > 0 && !node.isComponent) elementChildIndex++;

        if (isFirstNodeComponent && node == firstNode) {
          component = node;
          continue;
        }

        const dynamic = node.dynamic();

        if (dynamic) {
          if (ctx.hydratable) {
            if (node.isComponent) {
              currentId = locals.create(ID.component, nextMarker());
            } else if (i > 0) {
              currentId = locals.create(ID.element, nextElement());
            } else {
              currentId = getRootId();
            }
          } else {
            currentId = getCurrentElementId();
          }
        }

        if (node.isComponent) {
          if (ctx.hydratable && i > 0) template.push(MARKERS.component);
          component = node;
        } else {
          if (ctx.hydratable && i > 0 && dynamic) template.push(MARKERS.element);

          if (node.tagName === 'CustomElement') {
            for (let j = i; j < ast.tree.length; j++) {
              const node = ast.tree[j];
              if (isAttributeNode(node) && node.name === 'element') {
                definition = node;
                break;
              } else if (isStructuralNode(node)) {
                break;
              }
            }

            if (!definition) {
              const loc = kleur.bold(
                `${node.ref.getSourceFile().fileName} ${kleur.cyan(
                  `${node.ref.getStart()}:${node.ref.getEnd()}`,
                )}`,
              );
              throw Error(
                `[maverick] \`element\` prop was not provided for \`CustomElement\` at ${loc}`,
              );
            }

            template.push(`<\${${definition.value}.tagName}`);
            customElement = node;
          } else {
            template.push(`<${node.tagName}`);
          }

          elements.push(node);
        }
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$prop') {
            if (node.name === 'innerHTML') {
              expressions.push(createFunctionCall(RUNTIME.innerHTML, [currentId, node.value]));
              ctx.runtime.add(RUNTIME.innerHTML);
            } else if (customElement) {
              props.push(serializeComponentProp(node));
            } else {
              addAttrExpression(node, RUNTIME.prop);
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
              addAttrExpression(node, RUNTIME.cssvar);
            }
          }
        } else if (!node.dynamic) {
          if (node.name === 'style') {
            styles.push(trimTrailingSemicolon(trimQuotes(node.value)));
          } else {
            template.push(` ${node.name}="${escape(trimQuotes(node.value), true)}"`);
          }
        } else if (!customElement || node.name !== 'element') {
          addAttrExpression(node, RUNTIME.attr);
        }
      } else if (isRefNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.ref, [currentId, node.value]));
        ctx.runtime.add(RUNTIME.ref);
      } else if (isEventNode(node)) {
        const args = [currentId, createStringLiteral(node.type), node.value];
        if (node.namespace === '$oncapture') args.push(`1 /* CAPTURE */`);
        expressions.push(createFunctionCall(RUNTIME.listen, args));
        ctx.runtime.add(RUNTIME.listen);
      } else if (isDirectiveNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.directive, [currentId, node.name, node.value]));
        ctx.runtime.add(RUNTIME.directive);
      } else if (isTextNode(node)) {
        template.push(node.value);
      } else if (isExpressionNode(node)) {
        if (!node.dynamic) {
          template.push(encode(trimQuotes(node.value)));
        } else {
          if (ctx.hydratable) template.push(MARKERS.expression);
          const beforeId = ctx.hydratable ? null : getNextElementId();
          const id = ctx.hydratable
            ? locals.create(ID.expression, nextMarker())
            : beforeId || elementChildIndex === -1
            ? getParentElementId()
            : (currentId ??= getCurrentElementId());
          const insertId = ctx.hydratable ? RUNTIME.insertAtMarker : RUNTIME.insert;
          const code = !node.children ? node.value : serializeParentExpression(dom, node, ctx);
          expressions.push(
            createFunctionCall(insertId, [
              id,
              node.callId ?? (node.observable ? `() => ${code}` : code),
              beforeId,
            ]),
          );
          ctx.runtime.add(insertId);
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

    if (locals.size > 1 || expressions.length) {
      return isFirstNodeComponent
        ? expressions.join(';')
        : isFirstNodeFragment
        ? expressions[0]
        : [
            scoped && `(() => { `,
            locals.serialize(),
            '\n',
            ...expressions.join(';'),
            ';',
            '\n',
            '\n',
            `return ${getRootId()}`,
            scoped && '})()',
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

    return '';
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
