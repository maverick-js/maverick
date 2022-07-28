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
import { type ASTSerializer } from '../transform';
import { escapeHTML } from '../../utils/html';
import {
  createFunctionCall,
  createStringLiteral,
  Declarations,
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
      component = false,
      templateId: string | undefined,
      spreads: string[] = [],
      props: string[] = [],
      expressions: string[] = [],
      template: string[] = [],
      element!: ElementNode,
      elements: ElementNode[] = [],
      globals = ctx.globals,
      runtime = ctx.runtime,
      locals = new Declarations();

    const newMarkerId = () => {
      if (!markersId) {
        markersId = locals.create(ID.markers, createFunctionCall(RUNTIME.markers, [currentId]));
        runtime.add(RUNTIME.markers);
      }

      return `${markersId}[${dynamicElCount++}]`;
    };

    const addAttrExpression = (node: AttributeNode, runtimeId: string, named = true) => {
      const value = node.observable ? `() => ${node.value}` : node.value;

      expressions.push(
        createFunctionCall(
          runtimeId,
          named ? [currentId, createStringLiteral(node.name), value] : [currentId, value],
        ),
      );

      runtime.add(runtimeId);
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

          if (hasSpreads) runtime.add(RUNTIME.mergeProps);
        }

        continue;
      }

      if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          template.push('>');
        } else if (isElementEnd(node)) {
          element = elements.pop()!;
          template.push(element.isVoid ? ` />` : `</${element.tagName}>`);
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
            runtime.add(RUNTIME.element);
          } else {
            currentId = locals.create(node.isComponent ? ID.component : ID.element, newMarkerId());
          }
        }

        if (node.isComponent) {
          template.push(MARKERS.component);
          runtime.add(RUNTIME.insert);
          runtime.add(RUNTIME.component);
          component = true;
        } else {
          if (dynamic && dynamicElCount > 0) template.push(MARKERS.element);
          template.push(`<${node.tagName}`);
        }

        element = node;
        elements.push(node);
      } else if (isAttributeNode(node)) {
        if (node.namespace) {
          if (node.namespace === '$prop') {
            addAttrExpression(node, RUNTIME.prop);
          } else if (node.namespace === '$class') {
            addAttrExpression(node, RUNTIME.class);
          } else if (node.namespace === '$style') {
            addAttrExpression(node, RUNTIME.style);
          } else if (node.namespace === '$cssvar') {
            addAttrExpression(node, RUNTIME.cssvar);
          }
        } else if (!node.dynamic) {
          template.push(` ${node.name}="${escapeHTML(trimQuotes(node.value), true)}"`);
        } else {
          addAttrExpression(node, RUNTIME.attr);
        }
      } else if (isRefNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.ref, [currentId, node.value]));
        runtime.add(RUNTIME.ref);
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
          ctx.delegates.add(node.type);
        }

        runtime.add(RUNTIME.listen);
      } else if (isDirectiveNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.directive, [currentId, node.name, node.value]));
        runtime.add(RUNTIME.directive);
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
            [currentId, node.value, element.hasChildren && '1 /* HAS_CHILDREN */'].filter(
              Boolean,
            ) as string[],
          ),
        );
        runtime.add(RUNTIME.spread);
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

      runtime.add(RUNTIME.template);
    }

    if (locals.size) {
      const hasDelegate = ctx.delegates.size > 0;
      if (hasDelegate) runtime.add(RUNTIME.runHydrationEvents);

      return [
        `(() => { `,
        locals.serialize(),
        '\n',
        ...expressions.join(';'),
        ';',
        '\n',
        hasDelegate ? `\n${RUNTIME.runHydrationEvents}();\n` : '',
        '\n',
        `return ${ID.element}; `,
        '})()',
      ].join('');
    } else if (templateId) {
      const firstNode = ast.tree[0];
      const isSVG = isElementNode(firstNode) && firstNode.isSVG;
      runtime.add(RUNTIME.element);
      return createTemplate(templateId, isSVG, true);
    }

    return '';
  },
};
