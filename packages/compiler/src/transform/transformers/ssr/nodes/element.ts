import { camelToKebabCase, escapeHTML, trimQuotes } from '@maverick-js/std';
import { $ } from '@maverick-js/ts';
import type ts from 'typescript';

import { type AttributeNode, type ElementNode, isFragmentNode } from '../../../../parse/ast';
import { createElementSpreadProps } from '../../shared/factory';
import type { SsrVisitorContext } from '../state';

export function Element(node: ElementNode, { state, walk }: SsrVisitorContext) {
  const { runtime } = state,
    isRoot = walk.path.length === 0 || isFragmentNode(walk.path.at(-1)!);

  if (node.isDynamic()) {
    state.marker();
  }

  state.html += `<${node.name}`;

  if (node.spreads) {
    const attrs = runtime.mergeAttrs([
      ...node.spreads.map((s) => s.initializer),
      createElementSpreadProps(node, { ssr: true }),
    ]);

    state.value(attrs);
  } else {
    let classAttr: AttributeNode | null = null,
      stylesAttr: AttributeNode | null = null,
      props: ts.PropertyAssignment[] = [];

    function addProp(attr: AttributeNode, dynamic = attr.dynamic) {
      if (dynamic) {
        props.push($.createPropertyAssignment($.string(attr.name), attr.initializer));
      } else {
        state.html += ` ${attr.name}="${escapeHTML(trimQuotes(attr.initializer.getText()), true)}"`;
      }
    }

    if (node.attrs) {
      for (const attr of node.attrs) {
        if (attr.name === 'class') {
          classAttr = attr;
        } else if (attr.name === 'style') {
          stylesAttr = attr;
        } else {
          addProp(attr);
        }
      }
    }

    if (node.classes) {
      const base = classAttr?.initializer ?? $.null,
        $classProps = node.classes?.map((c) =>
          $.createPropertyAssignment($.string(c.name), c.initializer),
        ),
        classProps = $classProps ? runtime.class(base, $classProps) : base;

      props.push($.createPropertyAssignment('class', classProps));
    } else if (classAttr) {
      // Handle roots at runtime because of host props on component <Foo class={} $class:foo={}>.
      addProp(classAttr, isRoot || classAttr.dynamic);
    }

    if (node.styles || node.vars) {
      const base = stylesAttr?.initializer ?? $.null,
        $styleProps = node.styles?.map((s) =>
          $.createPropertyAssignment($.string(camelToKebabCase(s.name)), s.initializer),
        ),
        $varProps = node.vars?.map((s) =>
          $.createPropertyAssignment($.string(`--${s.name}`), s.initializer),
        ),
        styleProps =
          $styleProps || $varProps
            ? runtime.style(base, [...($styleProps ?? []), ...($varProps ?? [])])
            : base;

      props.push($.createPropertyAssignment('style', styleProps));
    } else if (stylesAttr) {
      // Handle roots at runtime because of host props on component <Foo $var:foo={}>.
      addProp(stylesAttr, isRoot || stylesAttr.dynamic);
    }

    if (props.length > 0) {
      state.value(runtime.attrs($.object(props, true)));
    }
  }

  if (node.isVoid) {
    state.html += '/>';
  } else {
    state.html += '>';

    if (node.content) {
      if (node.content.dynamic) {
        state.value(node.content.initializer);
      } else {
        state.html += trimQuotes(node.content.initializer.getText());
      }
    } else {
      walk.children();
    }

    state.html += `</${node.name}>`;
  }
}
