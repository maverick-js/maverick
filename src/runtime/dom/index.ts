export function $$_template(html: string, isSVG = false) {
  //
}

export function $$_element(template: HTMLTemplateElement) {
  //
}

export function $$_component(component: () => Node, props: Record<string, any>) {
  //
}

export function $$_markers() {
  //
}

export function $$_directive(
  node: Node,
  directive: (ref: Node, args: any[]) => void,
  args: unknown[],
) {
  //
}

export function $$_insert(marker: Comment, value: unknown) {
  //
}

export function $$_listen(
  node: Node,
  type: string,
  handler: unknown,
  isDelegate = false,
  isSVG = false,
) {
  //
}

export function $$_ref(node: Node, refs: (node: Node) => void | ((node: Node) => void)[]) {
  //
}

export function $$_attr(node: Node, name: string, value: unknown) {
  //
}

export function $$_prop(node: Node, name: string, value: unknown) {
  //
}

export function $$_class(node: Node, name: string, value: unknown) {
  //
}

export function $$_style(node: Node, name: string, value: unknown) {
  //
}

export function $$_cssvar(node: Node, name: string, value: unknown) {
  //
}

export function $$_spread(node: Node, name: string, value: unknown) {
  //
}

export function $$_inner_html(node: Node, value: unknown) {
  //
}

export function $$_inner_text(node: Node, value: unknown) {
  //
}

export function $$_text_content(node: Node, value: unknown) {
  //
}

export function $$_merge_props(...props: Record<string, any>[]) {
  //
}

export function $$_delegate_events(types: string[]) {
  //
}

export function $$_run_hydration_events() {
  //
}
