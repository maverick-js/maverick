import { decode } from 'html-entities';
import MagicString from 'magic-string';
import * as t from 'typescript';
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
  getAttrValue,
} from '../ast';
import { INNER_CONTENT_PROP } from '../jsx/constants';
import { type ASTSerializer } from '../transform';
import {
  createFunctionCall,
  createScopedDeclarations,
  createStringLiteral,
  trimWhitespace,
} from '../utils';

const spreadTrimRE = /(?:^\{\.{3})(.*)(?:\}$)/;

const ID = {
  template: '$$_templ',
  element: '$$_el',
  component: '$$_comp',
  markers: '$$_markers',
  expression: '$$_expr',
};

const RUNTIME = {
  createComponent: '$$_create_component',
  createTemplate: '$$_create_template',
  directive: '$$_directive',
  markers: '$$_markers',
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
  runHydrationEvents: '$$_run_hydration_events',
};

const MARKERS = {
  component: '<!C>',
  element: '<!E>',
  expression: '<!X>',
};

function createTemplate(template: string | string[], isSVG?: boolean) {
  return createFunctionCall(
    RUNTIME.createTemplate,
    [typeof template === 'string' ? template : template.join(''), isSVG && '1 /* SVG */'].filter(
      Boolean,
    ) as string[],
  );
}

export const dom: ASTSerializer = {
  serialize(ast, ctx) {
    let dynamicElCount = 0,
      currentId: string = '',
      markersId: string = '',
      delegate = false,
      templateId: string | undefined,
      expressions: string[] = [],
      template: string[] = [],
      element!: ElementNode,
      elements: ElementNode[] = [],
      globals = ctx.declarations,
      locals = createScopedDeclarations();

    // TODO: if component -> group props in an array (except ref/directive/events) + group all children?
    // map props to $$__create_props({ a:10, ..., get children() { return ...; } });
    // only children --> () => props.children

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
          getAttrValue(node),
        ]),
      );
      ctx.runtimeImports.add(runtimeId);
    };

    const addInnerContentExpression = (node: AttributeNode, runtimeId: string) => {
      expressions.push(createFunctionCall(runtimeId, [currentId, getAttrValue(node)]));
      ctx.runtimeImports.add(runtimeId);
    };

    for (const node of ast.tree) {
      if (isStructuralNode(node)) {
        if (isAttributesEnd(node)) {
          template.push('>');
        } else if (isElementEnd(node)) {
          element = elements.pop()!;
          if (!element?.isComponent) {
            template.push(element.isVoid ? `/>` : `</${element.tagName}>`);
            if (element.isSVG) template.push('</svg>');
          }
        }
      } else if (isElementNode(node)) {
        const dynamic = node.dynamic();

        if (dynamic) {
          if (!locals.has(ID.element)) {
            currentId = locals.create(
              ID.element,
              createFunctionCall(
                RUNTIME.createTemplate,
                [(templateId = globals.create(ID.template)), node.isSVG && '1 /* SVG */'].filter(
                  Boolean,
                ) as string[],
              ),
            );
            ctx.runtimeImports.add(RUNTIME.createTemplate);
          } else {
            currentId = locals.create(node.isComponent ? ID.component : ID.element, newMarkerId());
          }
        }

        if (node.isComponent) {
          template.push(MARKERS.component);
          expressions.push(
            createFunctionCall(RUNTIME.insert, [
              currentId,
              createFunctionCall(RUNTIME.createComponent, [node.tagName]),
            ]),
          );
          ctx.runtimeImports.add(RUNTIME.insert);
          ctx.runtimeImports.add(RUNTIME.createComponent);
        } else {
          if (node.isSVG) template.push('<svg>');
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
            addInnerContentExpression(node, RUNTIME.innerHTML);
          } else if (node.name === '$innerText') {
            addInnerContentExpression(node, RUNTIME.innerText);
          } else if (node.name === '$textContent') {
            addInnerContentExpression(node, RUNTIME.textContent);
          }
        } else if (typeof node.value === 'string' || t.isStringLiteral(node.value)) {
          template.push(`${node.name}="${getAttrValue(node)}"`);
        } else if (node.name === 'value' || node.name === 'checked') {
          addAttrExpression(node, RUNTIME.prop);
        } else {
          addAttrExpression(node, RUNTIME.attr);
        }
      } else if (isRefNode(node)) {
        expressions.push(createFunctionCall(RUNTIME.ref, [currentId, node.value.getText()]));
        ctx.runtimeImports.add(RUNTIME.ref);
      } else if (isEventNode(node)) {
        const capture = node.namespace === '$oncapture';
        expressions.push(
          createFunctionCall(
            RUNTIME.listen,
            [
              currentId,
              createStringLiteral(node.type),
              node.value.getText(),
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
        expressions.push(
          createFunctionCall(RUNTIME.directive, [currentId, node.name, node.value.getText()]),
        );
        ctx.runtimeImports.add(RUNTIME.directive);
      } else if (isTextNode(node)) {
        const text = decode(trimWhitespace(node.ref.getText()));
        if (text.length) template.push(text);
      } else if (isExpressionNode(node)) {
        if (typeof node.value === 'string') {
          template.push(node.value);
        } else {
          template.push(MARKERS.expression);

          const id = locals.create(ID.expression, newMarkerId());

          if (node.children) {
            let text = new MagicString(node.value.getText()),
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
                node.observable ? `() => ${node.value.getText()}` : node.value.getText(),
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
              node.ref.getText().replace(spreadTrimRE, '$1'),
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

      ctx.runtimeImports.add(RUNTIME.createTemplate);
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
    } else {
      const firstNode = ast.tree[0];
      const isSVG = isElementNode(firstNode) && firstNode.isSVG;
      ctx.runtimeImports.add(RUNTIME.createTemplate);
      return createTemplate(templateId!, isSVG);
    }
  },
};
