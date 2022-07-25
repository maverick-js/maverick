import { decode } from 'html-entities';
import MagicString from 'magic-string';
import {
  type AttributeNode,
  type ElementNode,
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
} from '../ast';
import { INNER_CONTENT_PROP } from '../jsx/constants';
import { type ASTSerializer } from '../transform';
import { escapeHTML } from '../../utils/html';
import {
  createFunctionCall,
  createScopedDeclarations,
  createStringLiteral,
  trimQuotes,
  trimWhitespace,
} from '../../utils/print';

const ID = {
  template: '$$_templ',
  element: '$$_el',
  component: '$$_comp',
  markers: '$$_mks',
  expression: '$$_expr',
};

const RUNTIME = {
  template: '$$_template',
  element: '$$_element',
  component: '$$_component',
  markers: '$$_markers',
  directive: '$$_directive',
  insert: '$$_insert',
  listen: '$$_listen',
  ref: '$$_ref',
  attr: '$$_attr',
  class: '$$_class',
  prop: '$$_prop',
  style: '$$_style',
  cssvar: '$$_cssvar',
  spread: '$$_spread',
  innerHTML: '$$_inner_html',
  innerText: '$$_inner_text',
  textContent: '$$_text_content',
  mergeProps: '$$_merge_props',
  runHydrationEvents: '$$_run_hydration_events',
};

const MARKERS = {
  component: '<!C>',
  element: '<!E>',
  expression: '<!X>',
};

function createTemplate(template: string | string[], isSVG?: boolean, create = false) {
  return createFunctionCall(
    create ? RUNTIME.element : RUNTIME.template,
    [
      typeof template === 'string' ? template : `\`${template.join('')}\``,
      isSVG && '1 /* SVG */',
    ].filter(Boolean) as string[],
  );
}

export const dom: ASTSerializer = {
  serialize(ast, ctx) {
    let dynamicElCount = 0,
      currentId: string = '',
      markersId: string = '',
      delegate = false,
      component = false,
      templateId: string | undefined,
      spreads: string[] = [],
      props: string[] = [],
      expressions: string[] = [],
      template: string[] = [],
      element!: ElementNode,
      elements: ElementNode[] = [],
      globals = ctx.declarations,
      locals = createScopedDeclarations();

    const newMarkerId = () => {
      if (!markersId) {
        markersId = locals.create(ID.markers, createFunctionCall(RUNTIME.markers, [currentId]));
        ctx.runtimeImports.add(RUNTIME.markers);
      }
      return `${markersId}[${dynamicElCount++}]`;
    };

    const addAttrExpression = (node: AttributeNode, runtimeId: string) => {
      expressions.push(
        createFunctionCall(runtimeId, [
          currentId,
          createStringLiteral(node.name),
          node.observable ? `() => ${node.value}` : node.value,
        ]),
      );
      ctx.runtimeImports.add(runtimeId);
    };

    for (const node of ast.tree) {
      if (component) {
        if (isAttributeNode(node) && !node.namespace) {
          if (!node.observable) {
            props.push(`${node.name}: ${node.value}`);
          } else {
            props.push(`get ${node.name}() { return ${node.value}; }`);
          }
        } else if (isSpreadNode(node)) {
          spreads.push(node.value);
        } else if (isStructuralNode(node) && isElementEnd(node)) {
          if (element.children) {
            props.push(`get children() { return ${dom.serialize(element.children, ctx)}; }`);
          }

          const hasProps = props.length > 0;
          const hasSpreads = spreads.length > 0;
          const propsExpr = hasProps ? `{ ${props.join(', ')} }` : '';

          expressions.push(
            createFunctionCall(RUNTIME.insert, [
              locals.create(ID.component, newMarkerId()),
              createFunctionCall(RUNTIME.component, [
                element.tagName,
                hasSpreads
                  ? !hasProps && spreads.length === 1
                    ? spreads[0]
                    : createFunctionCall(RUNTIME.mergeProps, [...spreads, propsExpr])
                  : propsExpr,
              ]),
            ]),
          );

          props = [];
          spreads = [];
          component = false;
          elements.pop();

          if (hasSpreads) ctx.runtimeImports.add(RUNTIME.mergeProps);
        }

        continue;
      }

      if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          template.push('>');
        } else if (isElementEnd(node)) {
          element = elements.pop()!;
          template.push(element.isVoid ? ` />` : `</${element.tagName}>`);
          // if (element.isSVG) template.push('</svg>');
        }
      } else if (isElementNode(node)) {
        const dynamic = node.dynamic();

        if (dynamic) {
          if (!locals.has(ID.element)) {
            currentId = locals.create(
              ID.element,
              createFunctionCall(
                RUNTIME.element,
                [(templateId = globals.create(ID.template)), node.isSVG && '1 /* SVG */'].filter(
                  Boolean,
                ) as string[],
              ),
            );
            ctx.runtimeImports.add(RUNTIME.element);
          } else {
            currentId = locals.create(node.isComponent ? ID.component : ID.element, newMarkerId());
          }
        }

        if (node.isComponent) {
          template.push(MARKERS.component);
          ctx.runtimeImports.add(RUNTIME.insert);
          ctx.runtimeImports.add(RUNTIME.component);
          component = true;
        } else {
          // if (node.isSVG) template.push('<svg>');
          if (dynamic && dynamicElCount > 0) template.push(MARKERS.element);
          template.push(`<${node.tagName}`);
        }

        element = node;
        elements.push(node);
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$attr') {
            addAttrExpression(node, RUNTIME.attr);
          } else if (node.namespace === '$class') {
            addAttrExpression(node, RUNTIME.class);
          } else if (node.namespace === '$style') {
            addAttrExpression(node, RUNTIME.style);
          } else if (node.namespace === '$cssvar') {
            addAttrExpression(node, RUNTIME.cssvar);
          } else {
            addAttrExpression(node, RUNTIME.prop);
          }
        } else if (INNER_CONTENT_PROP.has(node.name)) {
          if (node.name === '$innerHTML') {
            addAttrExpression(node, RUNTIME.innerHTML);
          } else if (node.name === '$innerText') {
            addAttrExpression(node, RUNTIME.innerText);
          } else if (node.name === '$textContent') {
            addAttrExpression(node, RUNTIME.textContent);
          }
        } else if (!node.dynamic) {
          template.push(` ${node.name}="${escapeHTML(trimQuotes(node.value), true)}"`);
        } else if (node.name === 'value' || node.name === 'checked') {
          addAttrExpression(node, RUNTIME.prop);
        } else {
          addAttrExpression(node, RUNTIME.attr);
        }
      } else if (isRefNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.ref, [currentId, node.value]));
        ctx.runtimeImports.add(RUNTIME.ref);
      } else if (isEventNode(node)) {
        const capture = node.namespace === '$oncapture';
        expressions.push(
          createFunctionCall(
            RUNTIME.listen,
            [
              currentId,
              createStringLiteral(node.type),
              node.value,
              (capture || node.delegate) && `${node.delegate ? 1 : 0} /* DELEGATE */`,
              capture && `1 /* CAPTURE */`,
            ].filter(Boolean) as string[],
          ),
        );

        if (node.delegate) {
          delegate = true;
          ctx.delegateEvents.add(node.type);
        }

        ctx.runtimeImports.add(RUNTIME.listen);
      } else if (isDirectiveNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.directive, [currentId, node.name, node.value]));
        ctx.runtimeImports.add(RUNTIME.directive);
      } else if (isTextNode(node)) {
        const text = decode(trimWhitespace(node.value));
        if (text.length) template.push(text);
      } else if (isExpressionNode(node)) {
        if (!node.dynamic) {
          template.push(trimQuotes(node.value));
        } else {
          template.push(MARKERS.expression);

          const id = locals.create(ID.expression, newMarkerId());

          if (node.children) {
            let text = new MagicString(node.value),
              start = node.ref.getStart() + 1;

            for (const ast of node.children) {
              text.overwrite(
                ast.root.getStart() - start,
                ast.root.getEnd() - start,
                dom.serialize(ast, ctx),
              );
            }

            expressions.push(
              createFunctionCall(RUNTIME.insert, [
                id,
                node.observable ? `() => ${text}` : text.toString(),
              ]),
            );
          } else {
            expressions.push(
              createFunctionCall(RUNTIME.insert, [
                id,
                node.observable ? `() => ${node.value}` : node.value,
              ]),
            );
          }
        }
      } else if (isSpreadNode(node)) {
        expressions.push(
          createFunctionCall(
            RUNTIME.spread,
            [
              currentId,
              node.value,
              (element.isSVG || element.hasChildren) && `${element.isSVG ? 1 : 0} /* SVG */`,
              element.hasChildren && '1 /* HAS_CHILDREN */',
            ].filter(Boolean) as string[],
          ),
        );
        ctx.runtimeImports.add(RUNTIME.spread);
      }
    }

    if (template.length) {
      const firstNode = ast.tree[0];
      const isSVG = isElementNode(firstNode) && firstNode.isSVG;
      const expression = createTemplate(template, isSVG);

      if (templateId) {
        globals.update(templateId, expression);
      } else {
        templateId = globals.create(ID.template, expression);
      }

      ctx.runtimeImports.add(RUNTIME.template);
    }

    if (locals.all.size) {
      if (delegate) ctx.runtimeImports.add(RUNTIME.runHydrationEvents);
      return [
        `(() => { `,
        `${locals.serialize()}`,
        ...expressions.join(';'),
        ';',
        delegate ? ` ${RUNTIME.runHydrationEvents}();` : '',
        ` return ${ID.element}; `,
        '})()',
      ].join('');
    } else if (templateId) {
      const firstNode = ast.tree[0];
      const isSVG = isElementNode(firstNode) && firstNode.isSVG;
      ctx.runtimeImports.add(RUNTIME.element);
      return createTemplate(templateId, isSVG, true);
    }

    return '';
  },
};
