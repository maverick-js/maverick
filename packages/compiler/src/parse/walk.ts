import {
  type AstNode,
  AstNodeKind,
  type ComponentNode,
  type ElementNode,
  type ExpressionNode,
  type FragmentNode,
  type TextNode,
} from './ast';

export function walk<State>(init: WalkerInit<State>) {
  new Walker<State>(init);
}

export interface NextState<State> {
  (node: AstNode): State;
}

export interface WalkerInit<State> {
  node: AstNode;
  visitors: Visitors<State>;
  state: State;
}

export class Walker<State = {}> {
  #node!: AstNode;
  #state!: State;
  #nextState = () => this.#state;
  #stopped = false;
  #visitors: Visitors<State>;

  /**
   * An array of parent nodes. For example, to get the root node you would do path.at(0); to get
   * the current node's immediate parent you would do path.at(-1).
   */
  readonly path: AstNode[] = [];

  constructor({ node, visitors, state }: WalkerInit<State>) {
    this.#visitors = visitors;
    this.visit(node, () => state);
  }

  /**
   * Allows you to control when child nodes are visited and which state they are visited with.
   */
  children(nextState: NextState<State> = this.#nextState) {
    if ('children' in this.#node && this.#node.children) {
      for (const child of this.#node.children) {
        this.visit(child, nextState);
      }
    }
  }

  /**
   * Prevents any subsequent traversal.
   */
  stop() {
    this.#stopped = true;
  }

  /**
   * Visit the given node with the given state and return the result.
   */
  visit(nextNode: AstNode, nextState: NextState<State>) {
    if (this.#stopped) return;

    const prevNode = this.#node,
      prevState = this.#state;

    if (this.#node) this.path.push(this.#node);
    this.#node = nextNode;
    this.#state = nextState(nextNode);

    const visitor = this.#getVisitor(nextNode.kind) as Visitor<AstNode, State>;

    const result = visitor?.(nextNode, {
      state: this.#state,
      walk: this,
    });

    this.path.pop();
    this.#node = prevNode;
    this.#state = prevState;

    return result;
  }

  #getVisitor(kind: AstNodeKind) {
    switch (kind) {
      case AstNodeKind.Element:
        return this.#visitors.Element;
      case AstNodeKind.Component:
        return this.#visitors.Component;
      case AstNodeKind.Expression:
        return this.#visitors.Expression;
      case AstNodeKind.Fragment:
        return this.#visitors.Fragment;
      case AstNodeKind.Text:
        return this.#visitors.Text;
    }
  }
}

export interface Visitor<Node extends AstNode, State> {
  (node: Node, context: VisitorContext<State>): void;
}

export interface Visitors<State = {}> {
  Element?: Visitor<ElementNode, State>;
  Component?: Visitor<ComponentNode, State>;
  Fragment?: Visitor<FragmentNode, State>;
  Expression?: Visitor<ExpressionNode, State>;
  Text?: Visitor<TextNode, State>;
}

export interface VisitorContext<State> {
  readonly state: State;
  readonly walk: Walker<State>;
}
